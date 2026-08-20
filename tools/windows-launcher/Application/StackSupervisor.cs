using System;
using System.Threading;
using ErpDatwork.Launcher.Application.Ports;
using ErpDatwork.Launcher.Domain;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Application
{
    internal sealed class StackSupervisor : IDisposable
    {
        private const int MaximumLaunchAttempts = 3;
        private const int MaximumUnhealthyChecks = 5;
        private readonly object sync = new object();
        private readonly LauncherConfiguration configuration;
        private readonly ILauncherLogger logger;
        private readonly IHealthProbe probe;
        private readonly IStackProcessFactory processFactory;
        private readonly IClock clock;
        private readonly bool automaticTicks;
        private readonly Timer timer;
        private IStackProcess ownedProcess;
        private LauncherStatus status;
        private bool desiredOnline;
        private int launchAttempts;
        private int unhealthyChecks;
        private int tickRunning;
        private DateTime nextAttemptAtUtc;

        internal StackSupervisor(LauncherConfiguration configuration, BoundedLogger logger)
            : this(
                configuration,
                logger,
                new HealthProbe(),
                new OwnedStackProcessFactory(logger),
                new SystemClock(),
                true)
        {
        }

        internal StackSupervisor(
            LauncherConfiguration configuration,
            ILauncherLogger logger,
            IHealthProbe probe,
            IStackProcessFactory processFactory,
            IClock clock,
            bool automaticTicks)
        {
            this.configuration = configuration;
            this.logger = logger;
            this.probe = probe;
            this.processFactory = processFactory;
            this.clock = clock;
            this.automaticTicks = automaticTicks;
            status = new LauncherStatus(LauncherState.Offline, "Ambiente local desligado");
            timer = automaticTicks ? new Timer(Tick, null, 1000, 5000) : null;
        }

        internal event Action<LauncherStatus> StatusChanged;

        internal LauncherStatus CurrentStatus
        {
            get { lock (sync) return status; }
        }

        internal string LogDirectory { get { return logger.DirectoryPath; } }

        internal void Start()
        {
            lock (sync)
            {
                if (desiredOnline && ownedProcess != null && ownedProcess.IsAlive) return;
                desiredOnline = true;
                launchAttempts = 0;
                unhealthyChecks = 0;
                nextAttemptAtUtc = clock.UtcNow;
                Publish(LauncherState.Starting, "Iniciando ambiente local");
            }
            if (automaticTicks) QueueImmediateTick();
        }

        internal void Stop()
        {
            lock (sync)
            {
                desiredOnline = false;
                StopOwnedProcess();
                Publish(LauncherState.Offline, "Ambiente local desligado");
            }
        }

        internal void Restart()
        {
            lock (sync)
            {
                desiredOnline = false;
                StopOwnedProcess();
                desiredOnline = true;
                launchAttempts = 0;
                unhealthyChecks = 0;
                nextAttemptAtUtc = clock.UtcNow;
                Publish(LauncherState.Starting, "Reiniciando ambiente local");
            }
            if (automaticTicks) QueueImmediateTick();
        }

        internal void EvaluateNow()
        {
            Tick(null);
        }

        private void QueueImmediateTick()
        {
            ThreadPool.QueueUserWorkItem(delegate { Tick(null); });
        }

        private void Tick(object ignored)
        {
            if (Interlocked.Exchange(ref tickRunning, 1) != 0) return;
            try
            {
                lock (sync) Evaluate();
            }
            catch (Exception error)
            {
                logger.Error("Falha no ciclo do launcher: " + error.GetType().Name + ".");
                lock (sync)
                {
                    desiredOnline = false;
                    StopOwnedProcess();
                    Publish(LauncherState.Error, "Erro no launcher local; consulte os logs");
                }
            }
            finally { Interlocked.Exchange(ref tickRunning, 0); }
        }

        private void Evaluate()
        {
            if (!desiredOnline) return;
            if (ownedProcess == null)
            {
                TryLaunchOwnedProcess();
                return;
            }
            if (!ownedProcess.IsAlive)
            {
                int exitCode = ownedProcess.ExitCode;
                ownedProcess.Dispose();
                ownedProcess = null;
                logger.Error("Stack local encerrou inesperadamente com código " + exitCode + ".");
                ScheduleRetryOrFail();
                return;
            }

            bool backendHealthy = probe.IsBackendHealthy(configuration.BackendHealthUri);
            bool frontendHealthy = probe.IsFrontendHealthy(configuration.FrontendUri);
            bool controlResponsive = ownedProcess.IsControlResponsive();
            if (controlResponsive && backendHealthy && frontendHealthy)
            {
                unhealthyChecks = 0;
                Publish(LauncherState.Online, "Ambiente local funcionando");
                return;
            }

            unhealthyChecks++;
            string pending = !controlResponsive ? "ownership do processo" :
                !backendHealthy && !frontendHealthy ? "backend e frontend" :
                !backendHealthy ? "backend" : "frontend";
            Publish(LauncherState.Starting, "Aguardando " + pending + " do ambiente local");
            if (unhealthyChecks < MaximumUnhealthyChecks) return;

            logger.Error("Probes locais não ficaram saudáveis no limite; reinício controlado.");
            StopOwnedProcess();
            ScheduleRetryOrFail();
        }

        private void TryLaunchOwnedProcess()
        {
            if (clock.UtcNow < nextAttemptAtUtc) return;
            bool backendAlreadyResponds = probe.IsBackendHealthy(configuration.BackendHealthUri);
            bool frontendAlreadyResponds = probe.IsFrontendHealthy(configuration.FrontendUri);
            if (backendAlreadyResponds || frontendAlreadyResponds)
            {
                desiredOnline = false;
                logger.Error("Serviço externo respondeu em porta reservada; nenhum processo foi assumido.");
                Publish(LauncherState.Error, "Porta local ocupada por processo externo");
                return;
            }

            launchAttempts++;
            IStackProcess candidate = null;
            try
            {
                candidate = processFactory.Create();
                candidate.Start(configuration);
                ownedProcess = candidate;
                unhealthyChecks = 0;
                Publish(LauncherState.Starting, "Serviços locais iniciados; verificando saúde");
            }
            catch (Exception error)
            {
                if (candidate != null) candidate.Dispose();
                ownedProcess = null;
                logger.Error("Falha ao criar processo próprio: " + error.GetType().Name + ".");
                ScheduleRetryOrFail();
            }
        }

        private void ScheduleRetryOrFail()
        {
            unhealthyChecks = 0;
            if (launchAttempts >= MaximumLaunchAttempts)
            {
                desiredOnline = false;
                Publish(LauncherState.Error, "Limite de tentativas atingido; consulte os logs");
                return;
            }
            int delaySeconds = launchAttempts == 1 ? 2 : launchAttempts == 2 ? 5 : 10;
            nextAttemptAtUtc = clock.UtcNow.AddSeconds(delaySeconds);
            Publish(LauncherState.Starting, "Nova tentativa local após backoff mínimo de " + delaySeconds + " segundos");
        }

        private void StopOwnedProcess()
        {
            if (ownedProcess == null) return;
            try { ownedProcess.Stop(); }
            catch (Exception error) { logger.Error("Falha ao encerrar processo próprio: " + error.GetType().Name + "."); }
            finally
            {
                ownedProcess.Dispose();
                ownedProcess = null;
            }
        }

        private void Publish(LauncherState nextState, string description)
        {
            if (status.State == nextState && String.Equals(status.Description, description, StringComparison.Ordinal)) return;
            status = new LauncherStatus(nextState, description);
            logger.Info("Estado local: " + nextState.ToString().ToUpperInvariant() + " — " + description + ".");
            Action<LauncherStatus> handler = StatusChanged;
            if (handler != null) handler(status);
        }

        public void Dispose()
        {
            if (timer != null) timer.Dispose();
            Stop();
        }
    }
}
