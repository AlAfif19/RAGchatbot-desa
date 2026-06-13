param(
    [int]$ApiPort = 8002,
    [int]$WebPort = 3000,
    [int]$WaPort = 3010,
    [int]$RunSeconds = 0
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Processes = New-Object System.Collections.Generic.List[System.Diagnostics.Process]
$Stopping = $false

function Set-DefaultEnv($Name, $Value) {
    if (-not [Environment]::GetEnvironmentVariable($Name, "Process")) {
        [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
    }
}

function Find-LocalBrowser {
    $candidates = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }
    return $null
}

function Assert-PortAvailable($Port, $Name) {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($connection) {
        throw "Port $Port is already in use for $Name by process id $($connection.OwningProcess). Stop that process or run scripts/dev.ps1 with a different port."
    }
}

function Write-ServiceLog($Name, $Line) {
    if ([string]::IsNullOrWhiteSpace($Line)) {
        return
    }
    Write-Host ("[{0}] {1}" -f $Name, $Line)
}

function ConvertTo-ProcessArguments([string[]]$Arguments) {
    return ($Arguments | ForEach-Object {
        if ($_ -match '[\s"]') {
            '"' + ($_ -replace '"', '\"') + '"'
        } else {
            $_
        }
    }) -join " "
}

function Start-ManagedProcess($Name, $FileName, [string[]]$Arguments, $WorkingDirectory) {
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $FileName
    $startInfo.Arguments = ConvertTo-ProcessArguments $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $process.EnableRaisingEvents = $true

    $outputAction = {
        if ($EventArgs.Data) {
            Write-ServiceLog $Event.MessageData $EventArgs.Data
        }
    }
    Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputAction -MessageData $Name | Out-Null
    Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $outputAction -MessageData $Name | Out-Null

    [void]$process.Start()
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    $Processes.Add($process)

    Write-Host ("[{0}] started pid {1}" -f $Name, $process.Id)
}

function Get-DescendantProcessIds($ParentProcessId) {
    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentProcessId" -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        foreach ($grandChildId in Get-DescendantProcessIds $child.ProcessId) {
            $grandChildId
        }
        $child.ProcessId
    }
}

function Stop-ManagedProcesses {
    $script:Stopping = $true
    foreach ($process in $Processes) {
        if ($process.HasExited) {
            continue
        }
        Write-Host ("[dev] stopping pid {0}" -f $process.Id)
        try {
            foreach ($childId in Get-DescendantProcessIds $process.Id) {
                Stop-Process -Id $childId -Force -ErrorAction SilentlyContinue
            }
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host ("[dev] failed to stop pid {0}: {1}" -f $process.Id, $_.Exception.Message)
        }
    }
}

Set-DefaultEnv "NEXT_PUBLIC_API_URL" ("http://127.0.0.1:{0}" -f $ApiPort)
Set-DefaultEnv "CORS_ORIGINS" ("http://localhost:{0},http://127.0.0.1:{0}" -f $WebPort)
Set-DefaultEnv "WA_CONNECTOR_URL" ("http://127.0.0.1:{0}" -f $WaPort)
Set-DefaultEnv "API_BASE_URL" ("http://127.0.0.1:{0}" -f $ApiPort)
Set-DefaultEnv "INTERNAL_API_TOKEN" "change_this_internal_token"
Set-DefaultEnv "PORT" ([string]$WaPort)
Set-DefaultEnv "WA_SESSION_PATH" (Join-Path $Root "apps\wa-connector\.wwebjs_auth")
$browserPath = Find-LocalBrowser
if ($browserPath) {
    Set-DefaultEnv "PUPPETEER_EXECUTABLE_PATH" $browserPath
}

$exitRegistration = Register-EngineEvent PowerShell.Exiting -Action { Stop-ManagedProcesses }
$cancelRegistration = Register-ObjectEvent -InputObject ([Console]) -EventName CancelKeyPress -Action {
    $EventArgs.Cancel = $true
    Stop-ManagedProcesses
}

try {
    Assert-PortAvailable $ApiPort "api"
    Assert-PortAvailable $WebPort "web"
    Assert-PortAvailable $WaPort "wa-connector"

    Write-Host "[dev] starting Chatbot Warga without Docker"
    Write-Host ("[dev] API: http://127.0.0.1:{0}" -f $ApiPort)
    Write-Host ("[dev] Web: http://127.0.0.1:{0}" -f $WebPort)
    Write-Host ("[dev] WA connector: http://127.0.0.1:{0}" -f $WaPort)
    Write-Host "[dev] press Ctrl+C to stop all services"

    Start-ManagedProcess "api" "python" @(
        "-m", "uvicorn", "app.main:app",
        "--app-dir", "apps/api",
        "--host", "127.0.0.1",
        "--port", ([string]$ApiPort),
        "--reload"
    ) $Root

    Start-ManagedProcess "web" "cmd.exe" @(
        "/c", "npm",
        "--prefix", "apps/web",
        "run", "dev", "--",
        "--hostname", "127.0.0.1",
        "--port", ([string]$WebPort)
    ) $Root

    Start-ManagedProcess "wa-connector" "cmd.exe" @(
        "/c", "npm",
        "--prefix", "apps/wa-connector",
        "start"
    ) $Root

    $startedAt = Get-Date
    while (-not $Stopping) {
        $exited = $Processes | Where-Object { $_.HasExited }
        if ($exited) {
            $names = ($exited | ForEach-Object { $_.Id }) -join ", "
            throw "Dev service exited unexpectedly. Process ids: $names"
        }
        $running = $Processes | Where-Object { -not $_.HasExited }
        if (-not $running) {
            throw "All dev services stopped."
        }
        if ($RunSeconds -gt 0 -and ((Get-Date) - $startedAt).TotalSeconds -ge $RunSeconds) {
            Write-Host ("[dev] RunSeconds reached after {0} seconds" -f $RunSeconds)
            break
        }
        Start-Sleep -Milliseconds 500
    }
} finally {
    Stop-ManagedProcesses
    Unregister-Event -SubscriptionId $exitRegistration.Id -ErrorAction SilentlyContinue
    Unregister-Event -SubscriptionId $cancelRegistration.Id -ErrorAction SilentlyContinue
    Write-Host "[dev] all services stopped"
}
