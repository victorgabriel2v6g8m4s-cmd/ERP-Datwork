$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $toolRoot "..\..")).Path
$outputRoot = Join-Path $toolRoot "bin"
$output = Join-Path $outputRoot "ERPDatworkLauncher.exe"
$iconPath = Join-Path $outputRoot "ERPDatwork.ico"
$legacyTestOutput = Join-Path $outputRoot "ERPDatworkLauncher.Tests.exe"
$logoPath = Join-Path $projectRoot "frontend\public\logo.png"

$compilerCandidates = @(
    (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
    (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
)
$compiler = $compilerCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $compiler) { throw "Compilador .NET Framework 4.x do Windows não encontrado." }
if (-not (Test-Path -LiteralPath $logoPath)) { throw "Logo do ERP não encontrado em frontend/public/logo.png." }

New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
if (Test-Path -LiteralPath $legacyTestOutput) { Remove-Item -LiteralPath $legacyTestOutput -Force }
Add-Type -AssemblyName System.Drawing
$sourceImage = [System.Drawing.Image]::FromFile($logoPath)
try {
    $bitmap = New-Object System.Drawing.Bitmap 64, 64
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($sourceImage, 0, 0, 64, 64)
        $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
        $stream = [System.IO.File]::Open($iconPath, [System.IO.FileMode]::Create)
        try { $icon.Save($stream) } finally { $stream.Dispose(); $icon.Dispose() }
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
} finally { $sourceImage.Dispose() }

$sources = Get-ChildItem -Path $toolRoot -Filter "*.cs" -Recurse -File |
    Where-Object { $_.FullName -notlike "$outputRoot*" -and $_.FullName -notlike "*\Tests\*" } |
    Select-Object -ExpandProperty FullName
if (-not $sources) { throw "Fontes do launcher não encontrados." }

$arguments = @(
    "/nologo", "/target:winexe", "/platform:anycpu", "/optimize+", "/warnaserror+",
    "/r:System.dll", "/r:System.Core.dll", "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll", "/r:System.Web.Extensions.dll",
    "/win32icon:$iconPath", "/out:$output"
) + $sources
& $compiler $arguments
if ($LASTEXITCODE -ne 0) { throw "Falha ao compilar o launcher do ERP Datwork." }
Write-Output $output
