@echo off
chcp 65001 >nul
title Deploy to VPS Server - PLN Nusa Daya
echo ========================================================
echo   Auto Deploy ke VPS Server upkaltimra.my.id
echo ========================================================
echo.
python "%~dp0deploy_server.py"
if errorlevel 1 (
    echo.
    echo [ERROR] Deployment gagal! Periksa koneksi internet atau SSH.
)
echo.
pause
