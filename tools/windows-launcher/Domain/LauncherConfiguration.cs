using System;

namespace ErpDatwork.Launcher.Domain
{
    internal sealed class LauncherConfiguration
    {
        internal LauncherConfiguration(
            string projectRoot,
            string nodePath,
            string stackScriptPath,
            Uri frontendUri,
            Uri backendHealthUri)
        {
            ProjectRoot = projectRoot;
            NodePath = nodePath;
            StackScriptPath = stackScriptPath;
            FrontendUri = frontendUri;
            BackendHealthUri = backendHealthUri;
        }

        internal string ProjectRoot { get; private set; }
        internal string NodePath { get; private set; }
        internal string StackScriptPath { get; private set; }
        internal Uri FrontendUri { get; private set; }
        internal Uri BackendHealthUri { get; private set; }
    }
}
