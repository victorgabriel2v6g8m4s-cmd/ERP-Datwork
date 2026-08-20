using System;
using System.IO;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Tests
{
    internal static class ConfigurationLoaderTests
    {
        internal static void Run()
        {
            string directory = Path.Combine(Path.GetTempPath(), "erp-launcher-test-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(directory);
            try
            {
                File.WriteAllText(Path.Combine(directory, "launcher.config.json"), new string('x', (16 * 1024) + 1));
                bool rejected = false;
                try { ConfigurationLoader.Load(directory); }
                catch (InvalidOperationException) { rejected = true; }
                TestAssert.True(rejected, "configuração maior que 16 KB deve ser rejeitada antes do parse");
            }
            finally { Directory.Delete(directory, true); }
        }
    }
}
