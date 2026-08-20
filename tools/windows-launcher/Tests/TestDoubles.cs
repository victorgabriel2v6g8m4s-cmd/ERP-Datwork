using System;
using System.Collections.Generic;
using ErpDatwork.Launcher.Application.Ports;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Tests
{
    internal sealed class FakeClock : IClock
    {
        internal FakeClock(DateTime initial) { UtcNow = initial; }
        public DateTime UtcNow { get; private set; }
        internal void AdvanceSeconds(int seconds) { UtcNow = UtcNow.AddSeconds(seconds); }
    }

    internal sealed class FakeLogger : ILauncherLogger
    {
        internal readonly List<string> Entries = new List<string>();
        public string DirectoryPath { get { return "C:\\logs"; } }
        public void Info(string message) { Entries.Add("INFO " + message); }
        public void Error(string message) { Entries.Add("ERROR " + message); }
    }

    internal sealed class FakeProbe : IHealthProbe
    {
        internal bool BackendHealthy;
        internal bool FrontendHealthy;
        internal int BackendCalls;
        internal int FrontendCalls;

        public bool IsBackendHealthy(Uri uri) { BackendCalls++; return BackendHealthy; }
        public bool IsFrontendHealthy(Uri uri) { FrontendCalls++; return FrontendHealthy; }
    }

    internal sealed class FakeStackProcess : IStackProcess
    {
        private readonly bool failStart;
        internal bool Started;
        internal bool Alive;
        internal bool ControlResponsive;
        internal bool Disposed;
        internal bool Stopped;
        internal int InvalidAliveReads;

        internal FakeStackProcess(bool failStart)
        {
            this.failStart = failStart;
            Alive = !failStart;
        }

        public bool IsAlive
        {
            get
            {
                if (!Started) { InvalidAliveReads++; throw new InvalidOperationException("Process never started"); }
                return Alive;
            }
        }

        public int ExitCode { get { return Alive ? 0 : 17; } }
        public bool IsControlResponsive() { return Started && Alive && ControlResponsive; }

        public void Start(LauncherConfiguration configuration)
        {
            if (failStart) throw new InvalidOperationException("SyntheticStartFailure");
            Started = true;
        }

        public void Stop() { Stopped = true; Alive = false; }
        public void Dispose() { Disposed = true; }
    }

    internal sealed class FakeStackProcessFactory : IStackProcessFactory
    {
        private readonly Queue<bool> failures;
        internal readonly List<FakeStackProcess> Created = new List<FakeStackProcess>();

        internal FakeStackProcessFactory(params bool[] startFailures)
        {
            failures = new Queue<bool>(startFailures);
        }

        public IStackProcess Create()
        {
            bool fail = failures.Count > 0 && failures.Dequeue();
            FakeStackProcess process = new FakeStackProcess(fail);
            Created.Add(process);
            return process;
        }
    }

    internal static class TestAssert
    {
        internal static void True(bool value, string message)
        {
            if (!value) throw new Exception("ASSERT TRUE: " + message);
        }

        internal static void Equal<T>(T expected, T actual, string message)
        {
            if (!EqualityComparer<T>.Default.Equals(expected, actual))
                throw new Exception("ASSERT EQUAL: " + message + "; expected=" + expected + "; actual=" + actual);
        }
    }
}
