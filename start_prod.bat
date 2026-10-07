@echo off
echo ========================================================
echo   Web Logsheet & HAR Portal PLN Nusa Daya (PROD MODE)
echo ========================================================
echo.

echo [1/2] Menjalankan Backend Go Fiber (:8080)...
start "PLN Logsheet Backend" cmd /k "cd /d %~dp0backend && server.exe"

timeout /t 2 /nobreak >nul

echo [2/2] Menjalankan Frontend Next.js Production (:3000)...
start "PLN Logsheet Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Layanan sedang berjalan:
echo - Backend API : http://localhost:8080
echo - Frontend Web: http://localhost:3000
echo.
pause
