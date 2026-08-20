namespace ErpDatwork.Launcher.Domain
{
    internal sealed class LauncherStatus
    {
        internal LauncherStatus(LauncherState state, string description)
        {
            State = state;
            Description = description;
        }

        internal LauncherState State { get; private set; }
        internal string Description { get; private set; }
    }
}
