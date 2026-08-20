using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace ErpDatwork.Launcher.Tests
{
    internal sealed class TestHttpEndpoint : IDisposable
    {
        private readonly TcpListener listener;
        private readonly Thread serverThread;
        private readonly string body;
        private readonly string contentType;
        private readonly int delayMilliseconds;

        internal TestHttpEndpoint(string path, string body, string contentType, int delayMilliseconds, bool includeContentLength = true)
        {
            this.body = body;
            this.contentType = contentType;
            this.delayMilliseconds = delayMilliseconds;
            IncludeContentLength = includeContentLength;
            listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port;
            Uri = new Uri("http://127.0.0.1:" + port + path);
            serverThread = new Thread(ServeOnce);
            serverThread.IsBackground = true;
            serverThread.Start();
        }

        internal Uri Uri { get; private set; }
        private bool IncludeContentLength { get; set; }

        private void ServeOnce()
        {
            try
            {
                using (TcpClient client = listener.AcceptTcpClient())
                using (NetworkStream stream = client.GetStream())
                {
                    ReadHeaders(stream);
                    if (delayMilliseconds > 0) Thread.Sleep(delayMilliseconds);
                    byte[] bodyBytes = Encoding.UTF8.GetBytes(body);
                    string lengthHeader = IncludeContentLength ? "\r\nContent-Length: " + bodyBytes.Length : String.Empty;
                    string headers = "HTTP/1.1 200 OK\r\nContent-Type: " + contentType +
                        lengthHeader + "\r\nConnection: close\r\n\r\n";
                    byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
                    stream.Write(headerBytes, 0, headerBytes.Length);
                    stream.Write(bodyBytes, 0, bodyBytes.Length);
                }
            }
            catch (IOException) { }
            catch (SocketException) { }
            finally { listener.Stop(); }
        }

        private static void ReadHeaders(Stream stream)
        {
            int matched = 0;
            byte[] terminator = new byte[] { 13, 10, 13, 10 };
            for (int count = 0; count < 8192; count++)
            {
                int value = stream.ReadByte();
                if (value < 0) return;
                matched = value == terminator[matched] ? matched + 1 : 0;
                if (matched == terminator.Length) return;
            }
        }

        public void Dispose()
        {
            listener.Stop();
            serverThread.Join(3000);
        }
    }
}
