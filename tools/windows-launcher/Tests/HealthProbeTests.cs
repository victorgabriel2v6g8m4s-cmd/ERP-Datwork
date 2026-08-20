using System;
using ErpDatwork.Launcher.Infrastructure;

namespace ErpDatwork.Launcher.Tests
{
    internal static class HealthProbeTests
    {
        internal static void Run()
        {
            HealthProbe probe = new HealthProbe();
            using (TestHttpEndpoint endpoint = new TestHttpEndpoint(
                "/health", "{\"status\":\"ok\",\"environment\":\"development\"}", "application/json", 0))
                TestAssert.True(probe.IsBackendHealthy(endpoint.Uri), "health JSON mínimo deve ser aceito");

            using (TestHttpEndpoint endpoint = new TestHttpEndpoint(
                "/health", new string('x', 5000), "application/json", 0, false))
                TestAssert.True(!probe.IsBackendHealthy(endpoint.Uri), "health oversized sem Content-Length deve ser rejeitado");

            using (TestHttpEndpoint endpoint = new TestHttpEndpoint(
                "/health", "status=ok", "application/json", 0))
                TestAssert.True(!probe.IsBackendHealthy(endpoint.Uri), "health não JSON deve ser rejeitado");

            using (TestHttpEndpoint endpoint = new TestHttpEndpoint(
                "/health", "{\"status\":\"ok\",\"environment\":\"development\"}", "application/json", 1600))
                TestAssert.True(!probe.IsBackendHealthy(endpoint.Uri), "health acima do timeout deve ser rejeitado");

            using (TestHttpEndpoint endpoint = new TestHttpEndpoint("/", "<!doctype html>", "text/html; charset=utf-8", 0))
                TestAssert.True(probe.IsFrontendHealthy(endpoint.Uri), "frontend HTML deve ser aceito");
        }
    }
}
