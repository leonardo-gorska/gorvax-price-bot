@echo off
title GorvaxBot Control Panel
echo ==============================================
echo GorvaxBot - Iniciando Sistema Completo...
echo ==============================================
echo.
echo DICA: Certifique-se de que o REDIS esta rodando!
echo.
echo Limpando residuos de memoria...
powershell -Command "Get-CimInstance Win32_Process -Filter \"Name = 'chrome.exe' or Name = 'chromium.exe'\" | Where-Object CommandLine -match '--headless' | Invoke-CimMethod -MethodName Terminate" >nul 2>&1

echo.
echo 1/2 - Iniciando o Bot (Telegram + Scraper)...
start "GorvaxBot Engine" cmd /c "npm run dev"

echo 2/2 - Iniciando o Dashboard Web (Next.js)...
cd /d "%~dp0\dashboard"
start "GorvaxBot Dashboard" cmd /c "npm run dev"

echo.
echo ==============================================
echo ✅ Tudo pronto! Use "parar_bot.bat" para fechar.
echo ==============================================
timeout /t 5
