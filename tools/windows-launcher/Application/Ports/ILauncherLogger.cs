namespace ErpDatwork.Launcher.Application.Ports
{
    internal interface ILauncherLogger
    {
        string DirectoryPath { get; }
        void Info(string message);
        void Error(string message);
    }
}
