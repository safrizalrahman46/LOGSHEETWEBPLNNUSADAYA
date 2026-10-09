@echo off
echo ========================================================
echo   Web Logsheet & HAR Portal PLN Nusa Daya (PRODUCTION)
echo ========================================================
echo.

echo [1/3] Menjalankan Backend Go Fiber (:8080)...
start "PLN Logsheet Backend" cmd /k "cd /d %~dp0backend && server.exe"

timeout /t 2 /nobreak >nul

echo [2/3] Cek build produksi frontend...
if not exist "%~dp0frontend\.next\BUILD_ID" (
  echo     Build belum ada, menjalankan "npm run build"... (1-3 menit)
  cd /d "%~dp0frontend" && npm run build
  if errorlevel 1 (
    echo     Build GAGAL. Buka ulang setelah kode diperbaiki.
    pause
    exit /b 1
  )
) else (
  echo     Build OK (BUILD_ID ditemukan^)
)

echo [3/3] Menjalankan Frontend Produksi (:3000)...
start "PLN Logsheet Frontend (Production)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Layanan sedang berjalan:
echo - Backend API : http://localhost:8080
echo - Frontend Web: http://localhost:3000  (mode produksi - cepat)
echo.
echo CATATAN: Setelah mengubah kode frontend, jalankan "npm run build"
echo di folder frontend, lalu tutup dan buka kembali jendela ini.
echo.
pause
