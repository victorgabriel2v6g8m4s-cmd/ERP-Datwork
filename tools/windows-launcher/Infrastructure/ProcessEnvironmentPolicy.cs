using System;
using System.Diagnostics;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal static class ProcessEnvironmentPolicy
    {
        private static readonly string[] WindowsAllowlist = new string[]
        {
            "SystemRoot", "WINDIR", "TEMP", "TMP"
        };

        internal static void Apply(ProcessStartInfo start, string pipeName, string controlToken)
        {
            start.EnvironmentVariables.Clear();
            foreach (string name in WindowsAllowlist)
            {
                string value = Environment.GetEnvironmentVariable(name);
                if (!String.IsNullOrEmpty(value)) start.EnvironmentVariables[name] = value;
            }
            start.EnvironmentVariables["ERP_LAUNCHER_CONTROL_PIPE"] = pipeName;
            start.EnvironmentVariables["ERP_LAUNCHER_CONTROL_TOKEN"] = controlToken;
        }
    }
}
