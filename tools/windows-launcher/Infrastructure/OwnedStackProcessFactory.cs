using ErpDatwork.Launcher.Application.Ports;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal sealed class OwnedStackProcessFactory : IStackProcessFactory
    {
        private readonly ILauncherLogger logger;

        internal OwnedStackProcessFactory(ILauncherLogger logger)
        {
            this.logger = logger;
        }

        public IStackProcess Create()
        {
            return new OwnedStackProcess(logger);
        }
    }
}
