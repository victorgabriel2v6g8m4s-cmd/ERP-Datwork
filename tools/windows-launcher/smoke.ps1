$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $toolRoot "..\..")).Path
$outputRoot = Join-Path $toolRoot "bin"
$configPath = Join-Path $outputRoot "launcher.config.json"
$runtimeRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot ".runtime\launcher"))
$allowedRuntimeParent = [System.IO.Path]::GetFullPath((Join-Path $projectRoot ".runtime")) + [System.IO.Path]::DirectorySeparatorChar
if (-not $runtimeRoot.StartsWith($allowedRuntimeParent, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Destino runtime do smoke test saiu da raiz permitida."
}
$launcher = $null

function Test-Url([string]$Url, [switch]$Backend) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        if ($response.StatusCode -ne 200) { return $false }
        if ($Backend) {
            $payload = $response.Content | ConvertFrom-Json
            return $payload.status -eq "ok" -and $payload.environment -eq "development"
        }
        return $response.Headers["Content-Type"] -like "text/html*"
    } catch { return $false }
}

try {
    $occupied = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -in @(3333, 5173) }
    if ($occupied) { throw "As portas locais 3333/5173 devem estar livres para o smoke test." }

    & (Join-Path $toolRoot "build.ps1") | Out-Null
    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    $config = [ordered]@{
        projectRoot = $projectRoot
        nodePath = (Resolve-Path -LiteralPath $nodePath).Path
        stackScriptPath = (Resolve-Path -LiteralPath (Join-Path $projectRoot "tools\dev-stack.mjs")).Path
        frontendUrl = "http://127.0.0.1:5173/"
        backendHealthUrl = "http://127.0.0.1:3333/health"
    } | ConvertTo-Json
    [System.IO.File]::WriteAllText($configPath, $config, (New-Object System.Text.UTF8Encoding($false)))

    $executable = Join-Path $outputRoot "ERPDatworkLauncher.exe"
    $launcher = Start-Process -FilePath $executable -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
    $deadline = [DateTime]::UtcNow.AddSeconds(35)
    $online = $false
    while ([DateTime]::UtcNow -lt $deadline -and -not $launcher.HasExited) {
        $backend = Test-Url "http://127.0.0.1:3333/health" -Backend
        $frontend = Test-Url "http://127.0.0.1:5173/"
        $logPath = Join-Path $runtimeRoot "launcher.log"
        $onlineLogged = (Test-Path -LiteralPath $logPath) -and
            ((Get-Content -Raw -LiteralPath $logPath) -match "Estado local: ONLINE")
        if ($backend -and $frontend -and $onlineLogged) { $online = $true; break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $online) { throw "O launcher não atingiu ONLINE com ownership e probes no prazo." }

    $exitEvent = [System.Threading.EventWaitHandle]::OpenExisting("Local\ERPDatworkWindowsLauncherExit")
    try { $exitEvent.Set() | Out-Null } finally { $exitEvent.Dispose() }
    if (-not $launcher.WaitForExit(15000)) { throw "O launcher não encerrou cooperativamente no prazo." }

    $portsDeadline = [DateTime]::UtcNow.AddSeconds(10)
    do {
        $remaining = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
            Where-Object { $_.LocalPort -in @(3333, 5173) }
        if (-not $remaining) { break }
        Start-Sleep -Milliseconds 300
    } while ([DateTime]::UtcNow -lt $portsDeadline)
    if ($remaining) { throw "Serviços locais permaneceram ativos após a saída cooperativa." }
    Write-Output "WINDOWS_LAUNCHER_SMOKE_OK"
} finally {
    if ($launcher -and -not $launcher.HasExited) {
        $taskKill = Join-Path ([Environment]::GetFolderPath("System")) "taskkill.exe"
        Start-Process -FilePath $taskKill -ArgumentList @("/PID", $launcher.Id, "/T", "/F") -WindowStyle Hidden -Wait | Out-Null
    }
    if (Test-Path -LiteralPath $configPath) { Remove-Item -LiteralPath $configPath -Force }
    if ($runtimeRoot.StartsWith($allowedRuntimeParent, [System.StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $runtimeRoot)) {
        Remove-Item -LiteralPath $runtimeRoot -Recurse -Force
    }
}
