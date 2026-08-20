using System;
using System.IO;
using System.Net;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using ErpDatwork.Launcher.Application.Ports;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal sealed class HealthProbe : IHealthProbe
    {
        private const int TimeoutMilliseconds = 1200;
        private const int MaximumHealthBodyCharacters = 4096;

        public bool IsBackendHealthy(Uri uri)
        {
            try
            {
                HttpWebRequest request = CreateRequest(uri);
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    if (response.StatusCode != HttpStatusCode.OK || response.ContentLength > MaximumHealthBodyCharacters) return false;
                    string body = ReadBoundedBody(response.GetResponseStream());
                    if (body == null) return false;
                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    Dictionary<string, object> payload = serializer.DeserializeObject(body) as Dictionary<string, object>;
                    object status;
                    object environment;
                    return payload != null && payload.TryGetValue("status", out status) &&
                        payload.TryGetValue("environment", out environment) &&
                        String.Equals(status as string, "ok", StringComparison.Ordinal) &&
                        String.Equals(environment as string, "development", StringComparison.Ordinal);
                }
            }
            catch (WebException) { return false; }
            catch (IOException) { return false; }
            catch (ArgumentException) { return false; }
            catch (InvalidOperationException) { return false; }
        }

        public bool IsFrontendHealthy(Uri uri)
        {
            try
            {
                HttpWebRequest request = CreateRequest(uri);
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                    return response.StatusCode == HttpStatusCode.OK &&
                        !String.IsNullOrEmpty(response.ContentType) &&
                        response.ContentType.StartsWith("text/html", StringComparison.OrdinalIgnoreCase);
            }
            catch (WebException) { return false; }
            catch (IOException) { return false; }
        }

        private static string ReadBoundedBody(Stream stream)
        {
            if (stream == null) return null;
            using (StreamReader reader = new StreamReader(stream))
            {
                char[] buffer = new char[MaximumHealthBodyCharacters + 1];
                int total = 0;
                while (total < buffer.Length)
                {
                    int read = reader.Read(buffer, total, buffer.Length - total);
                    if (read == 0) break;
                    total += read;
                }
                if (total > MaximumHealthBodyCharacters) return null;
                return new string(buffer, 0, total);
            }
        }

        private static HttpWebRequest CreateRequest(Uri uri)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
            request.Method = "GET";
            request.Timeout = TimeoutMilliseconds;
            request.ReadWriteTimeout = TimeoutMilliseconds;
            request.AllowAutoRedirect = false;
            request.Proxy = null;
            request.UserAgent = "ERP-Datwork-Local-Launcher/1.0";
            return request;
        }
    }
}
