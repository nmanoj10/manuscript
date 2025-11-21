# Saraswathi - Full Stack Manuscript Repository Quick Start
# Run in PowerShell: .\quickstart.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Saraswathi - Quick Start Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Backend Setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$serverDir = Join-Path $PSScriptRoot "server"
Push-Location $serverDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Backend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "[!] IMPORTANT: Edit server\.env.local with your API keys:" -ForegroundColor Yellow
    Write-Host "    - MONGODB_URI or MONGODB_ATLAS_URI" -ForegroundColor Yellow
    Write-Host "    - GEMINI_API_KEY" -ForegroundColor Yellow
    Write-Host "    - IMAGEKIT credentials" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue..."
}

Write-Host ""

# Frontend Setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendDir = Join-Path $PSScriptRoot "saraswathi"
Push-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
}

Pop-Location
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To run the application, open TWO terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  cd saraswathi" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:9002" -ForegroundColor White
Write-Host "  - API: http://localhost:3001/api" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
