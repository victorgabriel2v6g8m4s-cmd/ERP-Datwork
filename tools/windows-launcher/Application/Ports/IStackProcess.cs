using System;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Application.Ports
{
    internal interface IStackProcess : IDisposable
    {
        bool IsAlive { get; }
        int ExitCode { get; }
        bool IsControlResponsive();
        void Start(LauncherConfiguration configuration);
        void Stop();
    }
}
