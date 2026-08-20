using System;
using System.Threading;
using System.Windows.Forms;
using ErpDatwork.Launcher.Domain;
using ErpDatwork.Launcher.Infrastructure;
using ErpDatwork.Launcher.Presentation;

namespace ErpDatwork.Launcher
{
    internal static class Program
    {
        private const string MutexName = "Local\\ERPDatworkWindowsLauncher";
        private const string OpenEventName = "Local\\ERPDatworkWindowsLauncherOpen";
        private const string ExitEventName = "Local\\ERPDatworkWindowsLauncherExit";

        [STAThread]
        private static void Main(string[] args)
        {
            bool openWhenReady = HasOpenArgument(args);
            bool created;
            using (Mutex singleInstance = new Mutex(true, MutexName, out created))
            using (EventWaitHandle openEvent = new EventWaitHandle(false, EventResetMode.AutoReset, OpenEventName))
            using (EventWaitHandle exitEvent = new EventWaitHandle(false, EventResetMode.AutoReset, ExitEventName))
            {
                if (!created)
                {
                    if (openWhenReady) openEvent.Set();
                    return;
                }

                try
                {
                    LauncherConfiguration configuration = ConfigurationLoader.Load(AppDomain.CurrentDomain.BaseDirectory);
                    System.Windows.Forms.Application.EnableVisualStyles();
                    System.Windows.Forms.Application.SetCompatibleTextRenderingDefault(false);
                    using (TrayApplicationContext context = new TrayApplicationContext(configuration, openEvent, exitEvent, openWhenReady))
                        System.Windows.Forms.Application.Run(context);
                }
                catch (Exception error)
                {
                    MessageBox.Show(
                        "O inicializador local do ERP Datwork não pôde ser aberto.\n\n" + error.Message,
                        "ERP Datwork — ambiente local",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error);
                }
            }
        }

        private static bool HasOpenArgument(string[] args)
        {
            if (args == null || args.Length == 0) return false;
            return args.Length == 1 && String.Equals(args[0], "--open", StringComparison.OrdinalIgnoreCase);
        }
    }
}
