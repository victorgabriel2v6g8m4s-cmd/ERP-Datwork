using System;
using System.IO;
using ErpDatwork.Launcher.Application.Ports;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal sealed class BoundedLogger : ILauncherLogger
    {
        private const long MaxBytes = 1024 * 1024;
        private readonly object sync = new object();
        private readonly string logPath;
        private readonly string previousPath;

        internal BoundedLogger(string projectRoot)
        {
            string directory = Path.Combine(projectRoot, ".runtime", "launcher");
            Directory.CreateDirectory(directory);
            logPath = Path.Combine(directory, "launcher.log");
            previousPath = Path.Combine(directory, "launcher.previous.log");
        }

        public string DirectoryPath { get { return Path.GetDirectoryName(logPath); } }

        public void Info(string message) { Write("INFO", message); }
        public void Error(string message) { Write("ERROR", message); }

        private void Write(string level, string message)
        {
            string safeMessage = (message ?? String.Empty).Replace('\r', ' ').Replace('\n', ' ');
            if (safeMessage.Length > 800) safeMessage = safeMessage.Substring(0, 800);
            lock (sync)
            {
                try
                {
                    RotateIfNeeded();
                    File.AppendAllText(logPath, DateTimeOffset.Now.ToString("o") + " " + level + " " + safeMessage + Environment.NewLine);
                }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
            }
        }

        private void RotateIfNeeded()
        {
            if (!File.Exists(logPath) || new FileInfo(logPath).Length < MaxBytes) return;
            if (File.Exists(previousPath)) File.Delete(previousPath);
            File.Move(logPath, previousPath);
        }
    }
}
