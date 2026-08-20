using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using ErpDatwork.Launcher.Application;
using ErpDatwork.Launcher.Domain;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Presentation
{
    internal sealed class TrayApplicationContext : ApplicationContext
    {
        private readonly LauncherConfiguration configuration;
        private readonly StackSupervisor supervisor;
        private readonly NotifyIcon trayIcon;
        private readonly Control marshalControl;
        private readonly EventWaitHandle openRequest;
        private readonly EventWaitHandle exitRequest;
        private readonly System.Windows.Forms.Timer openRequestTimer;
        private readonly ToolStripMenuItem statusItem;
        private readonly ToolStripMenuItem startItem;
        private readonly ToolStripMenuItem stopItem;
        private readonly ToolStripMenuItem restartItem;
        private readonly ToolStripMenuItem openItem;
        private readonly ErrorNotificationGate errorNotificationGate;
        private readonly Icon brandIcon;
        private Icon statusIcon;
        private bool pendingOpen;
        private bool disposing;

        internal TrayApplicationContext(
            LauncherConfiguration configuration,
            EventWaitHandle openRequest,
            EventWaitHandle exitRequest,
            bool openWhenReady)
        {
            this.configuration = configuration;
            this.openRequest = openRequest;
            this.exitRequest = exitRequest;
            pendingOpen = openWhenReady;
            errorNotificationGate = new ErrorNotificationGate();
            marshalControl = new Control();
            IntPtr ignoredHandle = marshalControl.Handle;

            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ERPDatwork.ico");
            brandIcon = File.Exists(iconPath) ? new Icon(iconPath) : (Icon)SystemIcons.Application.Clone();
            trayIcon = new NotifyIcon();
            statusItem = new ToolStripMenuItem("Status: OFFLINE — ambiente local desligado");
            startItem = new ToolStripMenuItem("Ligar");
            stopItem = new ToolStripMenuItem("Desligar");
            restartItem = new ToolStripMenuItem("Reiniciar servidor");
            openItem = new ToolStripMenuItem("Abrir ERP no navegador");
            ConfigureMenu();

            BoundedLogger logger = new BoundedLogger(configuration.ProjectRoot);
            supervisor = new StackSupervisor(configuration, logger);
            supervisor.StatusChanged += OnStatusChanged;
            ApplyStatus(supervisor.CurrentStatus);
            trayIcon.Visible = true;

            openRequestTimer = new System.Windows.Forms.Timer();
            openRequestTimer.Interval = 500;
            openRequestTimer.Tick += delegate { CheckOpenRequest(); };
            openRequestTimer.Start();
            supervisor.Start();
        }

        private void ConfigureMenu()
        {
            statusItem.Enabled = false;
            openItem.Font = new Font(openItem.Font, FontStyle.Bold);
            openItem.Click += delegate { OpenErpIfOnline(); };
            startItem.Click += delegate { QueueAction(supervisor.Start); };
            stopItem.Click += delegate { QueueAction(supervisor.Stop); };
            restartItem.Click += delegate { QueueAction(supervisor.Restart); };

            ToolStripMenuItem logsItem = new ToolStripMenuItem("Abrir pasta de logs");
            logsItem.Click += delegate { OpenLogsDirectory(); };
            ToolStripMenuItem exitItem = new ToolStripMenuItem("Sair");
            exitItem.Click += delegate { ExitLauncher(); };

            ContextMenuStrip menu = new ContextMenuStrip();
            menu.Items.Add(statusItem);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add(startItem);
            menu.Items.Add(stopItem);
            menu.Items.Add(restartItem);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add(openItem);
            menu.Items.Add(logsItem);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add(exitItem);
            trayIcon.ContextMenuStrip = menu;
            trayIcon.DoubleClick += delegate { OpenErpIfOnline(); };
        }

        private void OnStatusChanged(LauncherStatus nextStatus)
        {
            if (disposing || marshalControl.IsDisposed) return;
            try { marshalControl.BeginInvoke(new Action<LauncherStatus>(ApplyStatus), nextStatus); }
            catch (InvalidOperationException) { }
        }

        private void ApplyStatus(LauncherStatus nextStatus)
        {
            statusItem.Text = "Status: " + nextStatus.State.ToString().ToUpperInvariant() + " — " + nextStatus.Description;
            trayIcon.Text = TruncateTooltip("ERP Datwork — " + nextStatus.State.ToString().ToUpperInvariant() + " — ambiente local");
            Icon nextIcon = StatusIconFactory.Create(brandIcon, nextStatus.State);
            Icon previous = statusIcon;
            statusIcon = nextIcon;
            trayIcon.Icon = nextIcon;
            if (previous != null) previous.Dispose();

            bool online = nextStatus.State == LauncherState.Online;
            startItem.Enabled = nextStatus.State == LauncherState.Offline || nextStatus.State == LauncherState.Error;
            stopItem.Enabled = nextStatus.State != LauncherState.Offline;
            restartItem.Enabled = nextStatus.State != LauncherState.Offline;
            openItem.Enabled = online;
            if (errorNotificationGate.ShouldNotify(nextStatus.State))
                ShowError(SanitizeNotification(nextStatus.Description) + ". Use 'Abrir pasta de logs' para ver os detalhes.");
            if (online && pendingOpen)
            {
                pendingOpen = false;
                OpenErp();
            }
        }

        private void CheckOpenRequest()
        {
            if (exitRequest.WaitOne(0))
            {
                ExitLauncher();
                return;
            }
            if (!openRequest.WaitOne(0)) return;
            pendingOpen = true;
            OpenErpIfOnline();
        }

        private void OpenErpIfOnline()
        {
            if (supervisor.CurrentStatus.State != LauncherState.Online) return;
            pendingOpen = false;
            OpenErp();
        }

        private void OpenErp()
        {
            ProcessStartInfo start = new ProcessStartInfo(configuration.FrontendUri.AbsoluteUri);
            start.UseShellExecute = true;
            Process.Start(start);
        }

        private void OpenLogsDirectory()
        {
            string explorer = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "explorer.exe");
            ProcessStartInfo start = new ProcessStartInfo(explorer, "\"" + supervisor.LogDirectory + "\"");
            start.UseShellExecute = false;
            Process.Start(start);
        }

        private void QueueAction(Action action)
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try { action(); }
                catch (Exception error)
                {
                    if (!disposing) ShowError("Falha no ambiente local: " + error.GetType().Name + ". Consulte os logs.");
                }
            });
        }

        private void ShowError(string message)
        {
            if (marshalControl.IsDisposed) return;
            marshalControl.BeginInvoke(new Action(delegate
            {
                trayIcon.BalloonTipTitle = "ERP Datwork — erro local";
                trayIcon.BalloonTipText = message;
                trayIcon.BalloonTipIcon = ToolTipIcon.Error;
                trayIcon.ShowBalloonTip(5000);
            }));
        }

        private void ExitLauncher()
        {
            stopItem.Enabled = false;
            restartItem.Enabled = false;
            QueueAction(delegate
            {
                supervisor.Stop();
                if (!marshalControl.IsDisposed) marshalControl.BeginInvoke(new Action(ExitThread));
            });
        }

        private static string TruncateTooltip(string value)
        {
            return value.Length <= 63 ? value : value.Substring(0, 63);
        }

        private static string SanitizeNotification(string value)
        {
            string sanitized = (value ?? "Erro no ambiente local").Replace('\r', ' ').Replace('\n', ' ').Trim();
            return sanitized.Length <= 180 ? sanitized : sanitized.Substring(0, 177) + "...";
        }

        protected override void Dispose(bool disposingManaged)
        {
            if (disposingManaged && !disposing)
            {
                disposing = true;
                openRequestTimer.Stop();
                openRequestTimer.Dispose();
                supervisor.StatusChanged -= OnStatusChanged;
                supervisor.Dispose();
                trayIcon.Visible = false;
                trayIcon.Dispose();
                if (statusIcon != null) statusIcon.Dispose();
                brandIcon.Dispose();
                marshalControl.Dispose();
            }
            base.Dispose(disposingManaged);
        }
    }
}
