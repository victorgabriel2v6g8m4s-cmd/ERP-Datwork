using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Tests
{
    internal static class ProcessEnvironmentPolicyTests
    {
        internal static void Run()
        {
            ProcessStartInfo start = new ProcessStartInfo();
            start.UseShellExecute = false;
            start.EnvironmentVariables["Path"] = "C:\\attacker";
            start.EnvironmentVariables["NODE_OPTIONS"] = "--require C:\\attacker.js";
            start.EnvironmentVariables["NODE_PATH"] = "C:\\attacker-modules";
            start.EnvironmentVariables["npm_config_registry"] = "https://attacker.invalid";
            start.EnvironmentVariables["DATABASE_URL"] = "secret";

            string pipe = "ERPDatwork-" + new string('a', 32);
            string token = new string('b', 64);
            ProcessEnvironmentPolicy.Apply(start, pipe, token);

            HashSet<string> allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "SystemRoot", "WINDIR", "TEMP", "TMP",
                "ERP_LAUNCHER_CONTROL_PIPE", "ERP_LAUNCHER_CONTROL_TOKEN"
            };
            foreach (DictionaryEntry entry in start.EnvironmentVariables)
                TestAssert.True(allowed.Contains((string)entry.Key), "Node pai recebeu variável não allowlisted: " + entry.Key);
            TestAssert.True(!start.EnvironmentVariables.ContainsKey("Path"), "Node pai não pode herdar Path");
            TestAssert.True(!start.EnvironmentVariables.ContainsKey("NODE_OPTIONS"), "Node pai não pode herdar NODE_OPTIONS");
            TestAssert.True(!start.EnvironmentVariables.ContainsKey("DATABASE_URL"), "Node pai não pode herdar segredos");
            TestAssert.Equal(pipe, start.EnvironmentVariables["ERP_LAUNCHER_CONTROL_PIPE"], "pipe deve chegar ao Node pai");
            TestAssert.Equal(token, start.EnvironmentVariables["ERP_LAUNCHER_CONTROL_TOKEN"], "nonce deve chegar ao Node pai");
        }
    }
}
