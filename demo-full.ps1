param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$travelRoot = Join-Path $root "TravelBookingSystem"
$uiRoot = Join-Path $root "polly-ui"
$dbPath = Join-Path $travelRoot "travel-booking-sm.db"

function Start-DemoProcess {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$DbPath,
        [string]$Command
    )

    if (-not (Test-Path -LiteralPath $WorkingDirectory)) {
        throw "Missing directory: $WorkingDirectory"
    }

    $envPrefix = ""
    if (-not [string]::IsNullOrWhiteSpace($DbPath)) {
        $envPrefix = "`$env:TRAVEL_BOOKING_DB_PATH = '$DbPath'; "
    }

    $fullCommand = "Set-Location -LiteralPath '$WorkingDirectory'; $envPrefix`$Host.UI.RawUI.WindowTitle = '$Title'; $Command"

    if ($DryRun) {
        Write-Host "[DRY-RUN] $Title"
        Write-Host "          $fullCommand"
        return
    }

    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $fullCommand | Out-Null
}

Write-Host "Starting full demo stack..."

Start-DemoProcess -Title "Mock Services" -WorkingDirectory $travelRoot -Command "dotnet run --project .\TravelBookingSystem.Services.Mock"
Start-Sleep -Seconds 1

Start-DemoProcess -Title "Saga Worker" -WorkingDirectory $travelRoot -DbPath $dbPath -Command "dotnet run --project .\SagaWorker"
Start-Sleep -Seconds 1

Start-DemoProcess -Title "API" -WorkingDirectory $travelRoot -DbPath $dbPath -Command "dotnet run --project .\TravelBookingSystem.Api"
Start-Sleep -Seconds 2

$uiCommand = "if (-not (Test-Path -LiteralPath '.\node_modules')) { npm install }; npm run dev"
Start-DemoProcess -Title "Polly UI" -WorkingDirectory $uiRoot -Command $uiCommand

if (-not $DryRun) {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173" | Out-Null
    Write-Host "Done. Opened UI at http://localhost:5173"
    Write-Host "If RabbitMQ is not running, start it first before booking."
} else {
    Write-Host "Dry run complete."
}
