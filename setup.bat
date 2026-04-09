@echo off
echo ========================================
echo    SafeCommute - Setup Script
echo ========================================
echo.

echo [1/3] Installing client dependencies...
cd client
call npm install
echo.

echo [2/3] Installing server dependencies...
cd ..\server
call npm install
echo.

echo [3/3] Setup complete!
echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To run the app:
echo 1. Open TWO terminal windows
echo 2. Terminal 1: cd server && npm run dev
echo 3. Terminal 2: cd client && npm start
echo.
echo Or run: npm run dev (from root)
echo.
pause
