using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Application
{
    internal sealed class ErrorNotificationGate
    {
        private LauncherState previousState = LauncherState.Offline;

        internal bool ShouldNotify(LauncherState nextState)
        {
            bool shouldNotify = nextState == LauncherState.Error && previousState != LauncherState.Error;
            previousState = nextState;
            return shouldNotify;
        }
    }
}
