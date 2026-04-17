@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "TRAVEL_ROOT=%ROOT%TravelBookingSystem"
set "UI_ROOT=%ROOT%polly-ui"
set "DB_PATH=%TRAVEL_ROOT%\travel-booking-sm.db"

if not exist "%TRAVEL_ROOT%" (
	echo [ERROR] Khong tim thay thu muc backend: "%TRAVEL_ROOT%"
	pause
	exit /b 1
)

if not exist "%UI_ROOT%" (
	echo [ERROR] Khong tim thay thu muc frontend: "%UI_ROOT%"
	pause
	exit /b 1
)

echo [CLEANUP] Stopping old demo processes...

for %%W in (
	"Mock Services"
	"Saga Worker"
	"API Gateway"
	"API"
	"Polly UI"
) do (
	taskkill /F /FI "WINDOWTITLE eq %%~W*" /T >nul 2>&1
)

for %%P in (
	TravelBookingSystem.Api.exe
	TravelBookingSystem.Services.Mock.exe
	SagaWorker.exe
) do (
	taskkill /F /T /IM "%%~P" >nul 2>&1
)

rem Stop only dotnet-hosted processes that belong to this demo backend.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process ^| Where-Object { $_.Name -eq 'dotnet.exe' -and $_.CommandLine -match 'TravelBookingSystem\.Api|TravelBookingSystem\.Services\.Mock|SagaWorker' } ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

rem Stop only node processes that belong to Polly UI dev server.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process ^| Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'polly-ui' -and $_.CommandLine -match 'vite|npm run dev' } ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

rem Force-release known demo ports in case stale processes were started outside this script.
for %%L in (5092 5143 5173) do (
	powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = %%L; Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess -Unique ^| ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo Starting full demo stack...

start "Mock Services" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%TRAVEL_ROOT%'; $Host.UI.RawUI.WindowTitle = 'Mock Services'; dotnet run --project .\TravelBookingSystem.Services.Mock"
echo Waiting for Mock Services port check on localhost:5092 ...
for /L %%I in (1,1,40) do (
	powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $ok = Test-NetConnection -ComputerName 'localhost' -Port 5092 -InformationLevel Quiet; if ($ok) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
	if not errorlevel 1 goto :mock_ready
	echo Mock Services not ready yet ^(attempt %%I/40^)...
	timeout /t 1 /nobreak >nul
)

echo [WARN] Mock Services did not become ready in time. Continuing startup...
goto :after_mock_wait

:mock_ready
echo Mock Services is ready.

:after_mock_wait

start "Saga Worker" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%TRAVEL_ROOT%'; $env:TRAVEL_BOOKING_DB_PATH = '%DB_PATH%'; $Host.UI.RawUI.WindowTitle = 'Saga Worker'; dotnet run --project .\SagaWorker"
echo Waiting 5 seconds for services to stabilize...
timeout /t 5 /nobreak >nul

start "API Gateway" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%TRAVEL_ROOT%'; $env:TRAVEL_BOOKING_DB_PATH = '%DB_PATH%'; $Host.UI.RawUI.WindowTitle = 'API Gateway'; dotnet run --project .\TravelBookingSystem.Api --urls http://localhost:5143"

echo Waiting for API health check on http://localhost:5143/api/metadata/hospitals ...
for /L %%I in (1,1,20) do (
	powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Uri 'http://localhost:5143/api/metadata/hospitals' -Method Get -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
	if not errorlevel 1 goto :api_ready
	echo API not ready yet ^(attempt %%I/20^)...
	timeout /t 1 /nobreak >nul
)

echo [WARN] API did not become ready in time. UI will still be started.
goto :after_api_wait

:api_ready
echo API is ready.

:after_api_wait

start "Polly UI" powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%UI_ROOT%'; $Host.UI.RawUI.WindowTitle = 'Polly UI'; if (-not (Test-Path -LiteralPath '.\node_modules')) { npm install }; npm run dev"

timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"

echo Done. UI opened at http://localhost:5173
echo Note: Dam bao RabbitMQ dang chay tren localhost:5672 truoc khi test booking.
echo Note: Ti le 2 thanh cong, 1 huy se reset moi lan Mock Services duoc restart.

exit /b 0
