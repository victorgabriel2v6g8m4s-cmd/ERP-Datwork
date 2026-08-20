param(
    [string]$NodePath,
    [switch]$StartNow
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Request-ExistingLauncherExit {
    try {
        $exitEvent = [System.Threading.EventWaitHandle]::OpenExisting("Local\ERPDatworkWindowsLauncherExit")
        try { $exitEvent.Set() | Out-Null } finally { $exitEvent.Dispose() }
        Start-Sleep -Milliseconds 900
    } catch [System.Threading.WaitHandleCannotBeOpenedException] { }
}

function Wait-LauncherBinaryAvailable([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    do {
        try {
            $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
            try { return } finally { $stream.Dispose() }
        } catch [System.IO.IOException] {
            Start-Sleep -Milliseconds 300
        }
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "O launcher ainda está em execução. Encerre-o pelo menu Sair e tente novamente."
}

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $toolRoot "..\..")).Path
$packagePath = Join-Path $projectRoot "package.json"
$package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
if ($package.name -ne "erp-datwork") { throw "A raiz resolvida não pertence ao ERP Datwork." }

if ([string]::IsNullOrWhiteSpace($NodePath)) {
    $nodeCommand = Get-Command node.exe -ErrorAction Stop
    $NodePath = $nodeCommand.Source
}
$resolvedNode = (Resolve-Path -LiteralPath $NodePath).Path
if ([System.IO.Path]::GetFileName($resolvedNode) -ine "node.exe") { throw "O runtime informado não é node.exe." }
$stackScript = (Resolve-Path -LiteralPath (Join-Path $projectRoot "tools\dev-stack.mjs")).Path

Request-ExistingLauncherExit
Wait-LauncherBinaryAvailable (Join-Path $toolRoot "bin\ERPDatworkLauncher.exe")
& (Join-Path $toolRoot "build.ps1") | Out-Null
$outputRoot = Join-Path $toolRoot "bin"
$executable = Join-Path $outputRoot "ERPDatworkLauncher.exe"
$iconPath = Join-Path $outputRoot "ERPDatwork.ico"
$configPath = Join-Path $outputRoot "launcher.config.json"

$config = [ordered]@{
    projectRoot = $projectRoot
    nodePath = $resolvedNode
    stackScriptPath = $stackScript
    frontendUrl = "http://127.0.0.1:5173/"
    backendHealthUrl = "http://127.0.0.1:3333/health"
}
$config | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8

$startupShortcut = Join-Path ([Environment]::GetFolderPath("Startup")) "ERP Datwork Launcher.lnk"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("DesktopDirectory")) "ERP Datwork.lnk"
$shell = New-Object -ComObject WScript.Shell

$startup = $shell.CreateShortcut($startupShortcut)
$startup.TargetPath = $executable
$startup.WorkingDirectory = $projectRoot
$startup.Description = "Inicia o ambiente local do ERP Datwork no login deste usuário."
$startup.IconLocation = "$iconPath,0"
$startup.WindowStyle = 7
$startup.Save()

$desktop = $shell.CreateShortcut($desktopShortcut)
$desktop.TargetPath = $executable
$desktop.Arguments = "--open"
$desktop.WorkingDirectory = $projectRoot
$desktop.Description = "Abre o ERP Datwork no navegador quando o ambiente local estiver pronto."
$desktop.IconLocation = "$iconPath,0"
$desktop.WindowStyle = 7
$desktop.Save()

if ($StartNow) {
    Start-Process -FilePath $executable -WorkingDirectory $projectRoot -WindowStyle Hidden
}
Write-Output $startupShortcut
Write-Output $desktopShortcut
