# Quick Status Check
Write-Host ""
Write-Host "=== AI Finance Tracker Status ===" -ForegroundColor Cyan

# Check backend .env
Write-Host ""
Write-Host "[Backend .env]" -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "OK - Exists" -ForegroundColor Green
} else {
    Write-Host "ERROR - Missing" -ForegroundColor Red
}

# Check frontend .env
Write-Host ""
Write-Host "[Frontend .env]" -ForegroundColor Yellow
if (Test-Path "frontend\.env") {
    Write-Host "OK - Exists" -ForegroundColor Green
    Write-Host ""
    Get-Content "frontend\.env"
} else {
    Write-Host "ERROR - Missing" -ForegroundColor Red
}

# Check if backend is running
Write-Host ""
Write-Host "[Backend Server]" -ForegroundColor Yellow
$backend = netstat -ano | Select-String ":5000.*LISTENING"
if ($backend) {
    Write-Host "OK - Running on port 5000" -ForegroundColor Green
} else {
    Write-Host "ERROR - Not running" -ForegroundColor Red
}

# Check if frontend is running
Write-Host ""
Write-Host "[Frontend Server]" -ForegroundColor Yellow
$frontend3000 = netstat -ano | Select-String ":3000.*LISTENING"
$frontend5173 = netstat -ano | Select-String ":5173.*LISTENING"
if ($frontend3000) {
    Write-Host "OK - Running on port 3000" -ForegroundColor Green
} elseif ($frontend5173) {
    Write-Host "OK - Running on port 5173" -ForegroundColor Green
} else {
    Write-Host "ERROR - Not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
