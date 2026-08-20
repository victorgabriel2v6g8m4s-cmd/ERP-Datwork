using System;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using ErpDatwork.Launcher.Application.Ports;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal sealed class OwnedStackProcess : IStackProcess
    {
        private readonly ILauncherLogger logger;
        private Process process;
        private string pipeName;
        private string controlToken;

        internal OwnedStackProcess(ILauncherLogger logger)
        {
            this.logger = logger;
        }

        public bool IsAlive
        {
            get
            {
                if (process == null) return false;
                try { return !process.HasExited; }
                catch (InvalidOperationException) { return false; }
            }
        }

        public int ExitCode
        {
            get
            {
                if (process == null) return -1;
                try { return process.HasExited ? process.ExitCode : 0; }
                catch (InvalidOperationException) { return -1; }
            }
        }

        public void Start(LauncherConfiguration configuration)
        {
            if (IsAlive) throw new InvalidOperationException("O stack já está em execução.");
            pipeName = "ERPDatwork-" + Guid.NewGuid().ToString("N");
            controlToken = CreateToken();

            ProcessStartInfo start = new ProcessStartInfo();
            start.FileName = configuration.NodePath;
            start.Arguments = Quote(configuration.StackScriptPath);
            start.WorkingDirectory = configuration.ProjectRoot;
            start.UseShellExecute = false;
            start.CreateNoWindow = true;
            start.WindowStyle = ProcessWindowStyle.Hidden;
            start.RedirectStandardOutput = false;
            start.RedirectStandardError = false;
            ProcessEnvironmentPolicy.Apply(start, pipeName, controlToken);

            Process candidate = new Process();
            candidate.StartInfo = start;
            candidate.EnableRaisingEvents = true;
            try
            {
                if (!candidate.Start()) throw new InvalidOperationException("O Windows recusou o início do stack local.");
            }
            catch
            {
                candidate.Dispose();
                process = null;
                pipeName = null;
                controlToken = null;
                throw;
            }
            process = candidate;
            logger.Info("Stack local iniciado; PID próprio " + process.Id + ".");
        }

        public void Stop()
        {
            Process owned = process;
            if (owned == null || owned.HasExited) return;
            bool cooperative = RequestCooperativeStop();
            if (cooperative && owned.WaitForExit(5000))
            {
                logger.Info("Stack local encerrado cooperativamente.");
                return;
            }
            if (owned.HasExited) return;
            logger.Error("Parada cooperativa expirou; acionando fallback na árvore do PID próprio " + owned.Id + ".");
            ForceOwnedTree(owned.Id);
            owned.WaitForExit(4000);
        }

        public bool IsControlResponsive()
        {
            Process owned = process;
            if (owned == null || !IsAlive) return false;
            try
            {
                using (NamedPipeClientStream pipe = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.Asynchronous))
                {
                    pipe.Connect(1200);
                    byte[] payload = Encoding.UTF8.GetBytes("ERP-DATWORK-CONTROL/1 STATUS " + controlToken + "\n");
                    pipe.Write(payload, 0, payload.Length);
                    pipe.Flush();
                    byte[] response = new byte[96];
                    IAsyncResult pending = pipe.BeginRead(response, 0, response.Length, null, null);
                    WaitHandle completion = pending.AsyncWaitHandle;
                    try
                    {
                        if (!completion.WaitOne(1200)) return false;
                        int read = pipe.EndRead(pending);
                        string actual = Encoding.UTF8.GetString(response, 0, read);
                        return String.Equals(actual, "ERP-DATWORK-CONTROL/1 OWNED " + owned.Id + "\n", StringComparison.Ordinal);
                    }
                    finally { completion.Close(); }
                }
            }
            catch (IOException) { return false; }
            catch (TimeoutException) { return false; }
            catch (InvalidOperationException) { return false; }
        }

        private bool RequestCooperativeStop()
        {
            try
            {
                using (NamedPipeClientStream pipe = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.None))
                {
                    pipe.Connect(1200);
                    byte[] payload = Encoding.UTF8.GetBytes("ERP-DATWORK-CONTROL/1 STOP " + controlToken + "\n");
                    pipe.Write(payload, 0, payload.Length);
                    pipe.Flush();
                    return true;
                }
            }
            catch (IOException) { return false; }
            catch (TimeoutException) { return false; }
        }

        private static void ForceOwnedTree(int ownedPid)
        {
            string taskKill = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "taskkill.exe");
            ProcessStartInfo kill = new ProcessStartInfo();
            kill.FileName = taskKill;
            kill.Arguments = "/PID " + ownedPid + " /T /F";
            kill.UseShellExecute = false;
            kill.CreateNoWindow = true;
            kill.WindowStyle = ProcessWindowStyle.Hidden;
            using (Process killer = Process.Start(kill))
            {
                if (killer != null) killer.WaitForExit(4000);
            }
        }

        private static string CreateToken()
        {
            byte[] bytes = new byte[32];
            using (RandomNumberGenerator random = RandomNumberGenerator.Create()) random.GetBytes(bytes);
            StringBuilder result = new StringBuilder(bytes.Length * 2);
            foreach (byte value in bytes) result.Append(value.ToString("x2"));
            return result.ToString();
        }

        private static string Quote(string value)
        {
            if (value.IndexOf('"') >= 0) throw new InvalidOperationException("Caminho contém caractere inválido.");
            return "\"" + value + "\"";
        }

        public void Dispose()
        {
            if (process != null) process.Dispose();
            process = null;
            pipeName = null;
            controlToken = null;
        }
    }
}
