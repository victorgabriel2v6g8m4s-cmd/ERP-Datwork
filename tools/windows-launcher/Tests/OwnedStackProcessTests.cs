using System;
using ErpDatwork.Launcher.Domain;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Tests
{
    internal static class OwnedStackProcessTests
    {
        internal static void Run()
        {
            LauncherConfiguration configuration = new LauncherConfiguration(
                "C:\\erp",
                "C:\\definitely-missing-erp-node.exe",
                "C:\\erp\\tools\\dev-stack.mjs",
                new Uri("http://127.0.0.1:5173/"),
                new Uri("http://127.0.0.1:3333/health"));
            using (OwnedStackProcess process = new OwnedStackProcess(new FakeLogger()))
            {
                bool failed = false;
                try { process.Start(configuration); }
                catch (System.ComponentModel.Win32Exception) { failed = true; }
                TestAssert.True(failed, "Process.Start inválido deve falhar de forma controlada");
                TestAssert.True(!process.IsAlive, "processo que nunca iniciou deve permanecer inativo");
                TestAssert.Equal(-1, process.ExitCode, "processo que nunca iniciou não possui exit code");
            }
        }
    }
}
