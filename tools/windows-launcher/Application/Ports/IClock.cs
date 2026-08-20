using System;

namespace ErpDatwork.Launcher.Application.Ports
{
    internal interface IClock
    {
        DateTime UtcNow { get; }
    }
}
