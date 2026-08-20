using System;

namespace ErpDatwork.Launcher.Tests
{
    internal static class TestProgram
    {
        private static int Main()
        {
            try
            {
                StackSupervisorTests.Run();
                OwnedStackProcessTests.Run();
                ProcessEnvironmentPolicyTests.Run();
                HealthProbeTests.Run();
                ConfigurationLoaderTests.Run();
                Console.WriteLine("WINDOWS_LAUNCHER_BEHAVIOR_OK");
                return 0;
            }
            catch (Exception error)
            {
                Console.Error.WriteLine(error.ToString());
                return 1;
            }
        }
    }
}
