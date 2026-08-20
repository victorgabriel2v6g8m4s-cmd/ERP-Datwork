using System;
using ErpDatwork.Launcher.Application.Ports;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal sealed class SystemClock : IClock
    {
        public DateTime UtcNow { get { return DateTime.UtcNow; } }
    }
}
