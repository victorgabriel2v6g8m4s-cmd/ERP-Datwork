using System;
using ErpDatwork.Launcher.Application;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Tests
{
    internal static class StackSupervisorTests
    {
        internal static void Run()
        {
            StartFailuresUseBoundedBackoffWithoutReadingUnstartedProcess();
            OnlineRequiresOwnedControlAndBothProbes();
            ExternalEndpointIsNeverAdopted();
            UnhealthyOwnedProcessIsStoppedAndRetried();
            ErrorNotificationOccursOncePerTransition();
        }

        private static LauncherConfiguration Configuration()
        {
            return new LauncherConfiguration(
                "C:\\erp", "C:\\node.exe", "C:\\erp\\tools\\dev-stack.mjs",
                new Uri("http://127.0.0.1:5173/"), new Uri("http://127.0.0.1:3333/health"));
        }

        private static StackSupervisor Supervisor(
            FakeLogger logger,
            FakeProbe probe,
            FakeStackProcessFactory factory,
            FakeClock clock)
        {
            return new StackSupervisor(Configuration(), logger, probe, factory, clock, false);
        }

        private static void StartFailuresUseBoundedBackoffWithoutReadingUnstartedProcess()
        {
            FakeClock clock = new FakeClock(new DateTime(2026, 8, 20, 12, 0, 0, DateTimeKind.Utc));
            FakeLogger logger = new FakeLogger();
            FakeProbe probe = new FakeProbe();
            FakeStackProcessFactory factory = new FakeStackProcessFactory(true, true, true);
            using (StackSupervisor supervisor = Supervisor(logger, probe, factory, clock))
            {
                supervisor.Start();
                supervisor.EvaluateNow();
                TestAssert.Equal(1, factory.Created.Count, "primeira falha deve contar como tentativa");
                supervisor.EvaluateNow();
                TestAssert.Equal(1, factory.Created.Count, "backoff deve bloquear tentativa imediata");
                clock.AdvanceSeconds(2);
                supervisor.EvaluateNow();
                TestAssert.Equal(2, factory.Created.Count, "segunda tentativa após 2 segundos");
                clock.AdvanceSeconds(4);
                supervisor.EvaluateNow();
                TestAssert.Equal(2, factory.Created.Count, "segundo backoff exige 5 segundos");
                clock.AdvanceSeconds(1);
                supervisor.EvaluateNow();
                TestAssert.Equal(3, factory.Created.Count, "terceira tentativa deve ocorrer");
                TestAssert.Equal(LauncherState.Error, supervisor.CurrentStatus.State, "terceira falha termina em ERROR");
            }
            foreach (FakeStackProcess process in factory.Created)
            {
                TestAssert.True(process.Disposed, "tentativa falha deve liberar Process");
                TestAssert.Equal(0, process.InvalidAliveReads, "processo nunca iniciado não pode consultar HasExited");
            }
        }

        private static void OnlineRequiresOwnedControlAndBothProbes()
        {
            FakeClock clock = new FakeClock(DateTime.UtcNow);
            FakeProbe probe = new FakeProbe();
            FakeStackProcessFactory factory = new FakeStackProcessFactory(false);
            using (StackSupervisor supervisor = Supervisor(new FakeLogger(), probe, factory, clock))
            {
                supervisor.Start();
                supervisor.EvaluateNow();
                FakeStackProcess process = factory.Created[0];
                probe.BackendHealthy = true;
                probe.FrontendHealthy = true;
                supervisor.EvaluateNow();
                TestAssert.Equal(LauncherState.Starting, supervisor.CurrentStatus.State, "probes sem handshake não ficam ONLINE");
                process.ControlResponsive = true;
                supervisor.EvaluateNow();
                TestAssert.Equal(LauncherState.Online, supervisor.CurrentStatus.State, "ownership e probes saudáveis ficam ONLINE");
            }
        }

        private static void ExternalEndpointIsNeverAdopted()
        {
            FakeProbe probe = new FakeProbe();
            probe.BackendHealthy = true;
            FakeStackProcessFactory factory = new FakeStackProcessFactory(false);
            using (StackSupervisor supervisor = Supervisor(new FakeLogger(), probe, factory, new FakeClock(DateTime.UtcNow)))
            {
                supervisor.Start();
                supervisor.EvaluateNow();
                TestAssert.Equal(LauncherState.Error, supervisor.CurrentStatus.State, "endpoint externo gera ERROR");
                TestAssert.Equal(0, factory.Created.Count, "endpoint externo não vira processo próprio");
            }
        }

        private static void UnhealthyOwnedProcessIsStoppedAndRetried()
        {
            FakeClock clock = new FakeClock(DateTime.UtcNow);
            FakeProbe probe = new FakeProbe();
            FakeStackProcessFactory factory = new FakeStackProcessFactory(false, false);
            using (StackSupervisor supervisor = Supervisor(new FakeLogger(), probe, factory, clock))
            {
                supervisor.Start();
                supervisor.EvaluateNow();
                FakeStackProcess first = factory.Created[0];
                first.ControlResponsive = true;
                for (int index = 0; index < 5; index++) supervisor.EvaluateNow();
                TestAssert.True(first.Stopped && first.Disposed, "processo sem probes deve ser parado e liberado");
                clock.AdvanceSeconds(2);
                supervisor.EvaluateNow();
                TestAssert.Equal(2, factory.Created.Count, "retry deve criar novo processo depois do backoff");
            }
        }

        private static void ErrorNotificationOccursOncePerTransition()
        {
            ErrorNotificationGate gate = new ErrorNotificationGate();
            TestAssert.True(!gate.ShouldNotify(LauncherState.Starting), "STARTING não notifica erro");
            TestAssert.True(gate.ShouldNotify(LauncherState.Error), "primeira transição ERROR notifica");
            TestAssert.True(!gate.ShouldNotify(LauncherState.Error), "ERROR repetido não notifica novamente");
            TestAssert.True(!gate.ShouldNotify(LauncherState.Online), "ONLINE rearma sem notificar");
            TestAssert.True(gate.ShouldNotify(LauncherState.Error), "nova transição ERROR notifica uma vez");
        }
    }
}
