@echo off
echo ========================================
echo    Starting SafeCommute
echo ========================================
echo.
echo Starting both frontend and backend...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.

start cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "cd client && npm start"

echo.
echo Both servers starting in separate windows...
echo Close this window when done.
pause
