@echo off
echo ==============================================
echo GorvaxBot - Desligando Sistema Completo...
echo ==============================================
echo.
echo 1/3 - Fechando janelas do terminal...
taskkill /FI "WINDOWTITLE eq GorvaxBot Engine*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq GorvaxBot Dashboard*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq GorvaxBot Control Panel*" /T /F >nul 2>&1

echo 2/3 - Encerrando processos Node.js (Bot e Next.js)...
taskkill /IM node.exe /F >nul 2>&1

echo 3/3 - Limpando instancias ocultas do Google Chrome...
powershell -Command "Get-CimInstance Win32_Process -Filter \"Name = 'chrome.exe' or Name = 'chromium.exe'\" | Where-Object CommandLine -match '--headless' | Invoke-CimMethod -MethodName Terminate" >nul 2>&1

echo.
echo ==============================================
echo ✅ Sistema desligado com sucesso! RAM liberada.
echo ==============================================
timeout /t 3
