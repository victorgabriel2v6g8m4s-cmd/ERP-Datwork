using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Script.Serialization;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Infrastructure
{
    internal static class ConfigurationLoader
    {
        private const string ExpectedPackageName = "erp-datwork";
        private const long MaximumConfigBytes = 16 * 1024;
        private const long MaximumPackageBytes = 64 * 1024;

        internal static LauncherConfiguration Load(string executableDirectory)
        {
            string configPath = Path.Combine(executableDirectory, "launcher.config.json");
            if (!File.Exists(configPath))
                throw new InvalidOperationException("Configuração local ausente. Execute launcher:install.");

            Dictionary<string, object> values = ReadObject(configPath, MaximumConfigBytes);
            string projectRoot = CanonicalDirectory(GetString(values, "projectRoot"));
            string nodePath = CanonicalFile(GetString(values, "nodePath"));
            string scriptPath = CanonicalFile(GetString(values, "stackScriptPath"));

            ValidateProject(projectRoot);
            ValidateNode(nodePath);
            ValidateStackScript(projectRoot, scriptPath);

            Uri frontendUri = ValidateLoopbackUrl(GetString(values, "frontendUrl"), 5173, "/", "frontendUrl");
            Uri backendUri = ValidateLoopbackUrl(GetString(values, "backendHealthUrl"), 3333, "/health", "backendHealthUrl");
            return new LauncherConfiguration(projectRoot, nodePath, scriptPath, frontendUri, backendUri);
        }

        private static Dictionary<string, object> ReadObject(string path, long maximumBytes)
        {
            if (new FileInfo(path).Length > maximumBytes)
                throw new InvalidOperationException("Arquivo JSON local excede o limite permitido.");
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            object parsed = serializer.DeserializeObject(File.ReadAllText(path));
            Dictionary<string, object> result = parsed as Dictionary<string, object>;
            if (result == null) throw new InvalidOperationException("Configuração local inválida.");
            return result;
        }

        private static string GetString(Dictionary<string, object> values, string key)
        {
            object value;
            if (!values.TryGetValue(key, out value) || !(value is string) || String.IsNullOrWhiteSpace((string)value))
                throw new InvalidOperationException("Campo obrigatório inválido: " + key + ".");
            return (string)value;
        }

        private static string CanonicalDirectory(string path)
        {
            string fullPath = Path.GetFullPath(path);
            if (!Directory.Exists(fullPath)) throw new DirectoryNotFoundException("Raiz do projeto não encontrada.");
            return new DirectoryInfo(fullPath).FullName.TrimEnd(Path.DirectorySeparatorChar);
        }

        private static string CanonicalFile(string path)
        {
            string fullPath = Path.GetFullPath(path);
            if (!File.Exists(fullPath)) throw new FileNotFoundException("Arquivo configurado não encontrado.");
            return new FileInfo(fullPath).FullName;
        }

        private static void ValidateProject(string projectRoot)
        {
            string packagePath = Path.Combine(projectRoot, "package.json");
            if (!File.Exists(packagePath)) throw new InvalidOperationException("package.json da raiz não encontrado.");
            Dictionary<string, object> package = ReadObject(packagePath, MaximumPackageBytes);
            if (!String.Equals(GetString(package, "name"), ExpectedPackageName, StringComparison.Ordinal))
                throw new InvalidOperationException("A raiz configurada não pertence ao ERP Datwork.");
        }

        private static void ValidateNode(string nodePath)
        {
            if (!String.Equals(Path.GetFileName(nodePath), "node.exe", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("O runtime configurado não é node.exe.");
        }

        private static void ValidateStackScript(string projectRoot, string scriptPath)
        {
            string expected = Path.GetFullPath(Path.Combine(projectRoot, "tools", "dev-stack.mjs"));
            if (!String.Equals(expected, scriptPath, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("O script configurado não é o stack fixo do ERP.");
        }

        private static Uri ValidateLoopbackUrl(string value, int expectedPort, string expectedPath, string field)
        {
            Uri uri;
            if (!Uri.TryCreate(value, UriKind.Absolute, out uri) || uri.Scheme != Uri.UriSchemeHttp)
                throw new InvalidOperationException(field + " deve ser uma URL HTTP absoluta.");
            if (!String.Equals(uri.Host, "127.0.0.1", StringComparison.Ordinal) || uri.UserInfo.Length > 0)
                throw new InvalidOperationException(field + " deve usar somente 127.0.0.1.");
            if (uri.Port != expectedPort)
                throw new InvalidOperationException(field + " possui porta inesperada.");
            if (!String.Equals(uri.AbsolutePath, expectedPath, StringComparison.Ordinal) || uri.Query.Length > 0 || uri.Fragment.Length > 0)
                throw new InvalidOperationException(field + " possui caminho inesperado.");
            return uri;
        }
    }
}
