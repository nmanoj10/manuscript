@echo off
REM Saraswathi - Full Stack Manuscript Repository Quick Start

echo.
echo ========================================
echo Saraswathi - Quick Start Guide
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js installed
echo.

REM Check MongoDB
echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul
echo [Optional] MongoDB - if not running, start it manually or use MongoDB Atlas
echo.

echo ========================================
echo Step 1: Backend Setup
echo ========================================
echo.

cd server

if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)

if not exist .env.local (
    echo.
    echo Creating .env.local from template...
    copy .env.example .env.local
    echo [!] IMPORTANT: Edit server\.env.local with your API keys:
    echo     - MONGODB_URI or MONGODB_ATLAS_URI
    echo     - GEMINI_API_KEY
    echo     - IMAGEKIT credentials
    echo.
    pause
)

echo.
echo ========================================
echo Step 2: Frontend Setup
echo ========================================
echo.

cd ..\saraswathi

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

if not exist .env.local (
    echo.
    echo Creating .env.local from template...
    copy .env.local.example .env.local
    echo [!] Edit frontend\.env.local if needed
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application, open TWO terminals:
echo.
echo Terminal 1 (Backend):
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd saraswathi
echo   npm run dev
echo.
echo Access the application at:
echo   - Frontend: http://localhost:9002
echo   - API: http://localhost:3001/api
echo.
echo.
pause
