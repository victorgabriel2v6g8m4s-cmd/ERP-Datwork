$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

try {
    $exitEvent = [System.Threading.EventWaitHandle]::OpenExisting("Local\ERPDatworkWindowsLauncherExit")
    try { $exitEvent.Set() | Out-Null } finally { $exitEvent.Dispose() }
    Start-Sleep -Milliseconds 900
} catch [System.Threading.WaitHandleCannotBeOpenedException] { }

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupShortcut = Join-Path ([Environment]::GetFolderPath("Startup")) "ERP Datwork Launcher.lnk"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("DesktopDirectory")) "ERP Datwork.lnk"
$configPath = Join-Path $toolRoot "bin\launcher.config.json"

foreach ($target in @($startupShortcut, $desktopShortcut, $configPath)) {
    if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Force }
}
Write-Output "Inicialização automática, atalho e configuração local do ERP Datwork removidos."
