using System;

namespace ErpDatwork.Launcher.Application.Ports
{
    internal interface IHealthProbe
    {
        bool IsBackendHealthy(Uri uri);
        bool IsFrontendHealthy(Uri uri);
    }
}
