@echo off
echo ========================================================
echo   Web Logsheet & HAR Portal PLN Nusa Daya (DOCKER)
echo ========================================================
echo.

echo Memulai container Docker (PostgreSQL, Backend Go, Frontend Next.js)...
docker compose up -d

echo.
echo Status container:
docker compose ps

echo.
echo Layanan sedang berjalan:
echo - Frontend Web : http://localhost:3000
echo - Backend API  : http://localhost:8080
echo - PostgreSQL   : localhost:5434 (internal port 5432)
echo.
pause
