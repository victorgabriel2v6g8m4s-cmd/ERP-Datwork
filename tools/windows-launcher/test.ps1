$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$temporaryParent = [System.IO.Path]::GetFullPath((Join-Path ([System.IO.Path]::GetTempPath()) "erp-datwork-launcher-tests"))
$allowedPrefix = $temporaryParent.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$runRoot = [System.IO.Path]::GetFullPath((Join-Path $temporaryParent ([Guid]::NewGuid().ToString("N"))))
if (-not $runRoot.StartsWith($allowedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Diretório temporário dos testes saiu da raiz permitida."
}
$testOutput = Join-Path $runRoot "ERPDatworkLauncher.Tests.exe"
$compilerCandidates = @(
    (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
    (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
)
$compiler = $compilerCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $compiler) { throw "Compilador .NET Framework 4.x do Windows não encontrado." }
New-Item -ItemType Directory -Path $runRoot -Force | Out-Null

try {
    $sources = @()
    foreach ($region in @("Domain", "Application", "Infrastructure", "Tests")) {
        $sources += Get-ChildItem -Path (Join-Path $toolRoot $region) -Filter "*.cs" -Recurse -File |
            Select-Object -ExpandProperty FullName
    }
    $arguments = @(
        "/nologo", "/target:exe", "/platform:anycpu", "/optimize+", "/warnaserror+",
        "/main:ErpDatwork.Launcher.Tests.TestProgram",
        "/r:System.dll", "/r:System.Core.dll", "/r:System.Web.Extensions.dll",
        "/out:$testOutput"
    ) + $sources
    & $compiler $arguments
    if ($LASTEXITCODE -ne 0) { throw "Falha ao compilar os testes comportamentais do launcher." }
    & $testOutput
    if ($LASTEXITCODE -ne 0) { throw "Testes comportamentais do launcher falharam." }
} finally {
    for ($attempt = 0; $attempt -lt 10 -and (Test-Path -LiteralPath $runRoot); $attempt++) {
        try { Remove-Item -LiteralPath $runRoot -Recurse -Force -ErrorAction Stop }
        catch [System.IO.IOException] { Start-Sleep -Milliseconds 200 }
        catch [System.UnauthorizedAccessException] { Start-Sleep -Milliseconds 200 }
    }
    if (Test-Path -LiteralPath $runRoot) {
        throw "Falha ao remover o diretório temporário exclusivo dos testes."
    }
}
