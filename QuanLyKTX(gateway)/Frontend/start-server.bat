@echo off
echo ========================================
echo   QUAN LY KY TUC XA - FRONTEND SERVER
echo ========================================
echo.
echo Dang khoi dong server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Su dung Python HTTP Server...
    echo.
    echo Server dang chay tai: http://localhost:8080
    echo.
    echo Nhan Ctrl+C de dung server
    echo.
    python -m http.server 8080
    goto :end
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Su dung Node.js HTTP Server...
    echo.
    echo Dang cai dat http-server...
    npm install -g http-server >nul 2>&1
    echo.
    echo Server dang chay tai: http://localhost:8080
    echo.
    echo Nhan Ctrl+C de dung server
    echo.
    http-server -p 8080 -c-1
    goto :end
)

echo ERROR: Khong tim thay Python hoac Node.js!
echo.
echo Vui long cai dat mot trong hai:
echo - Python: https://www.python.org/downloads/
echo - Node.js: https://nodejs.org/
echo.
echo Hoac su dung Visual Studio Code voi extension "Live Server"
echo.
pause
:end

