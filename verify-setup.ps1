# Verification Script for AI Finance Tracker
# Run this to check if everything is configured correctly

Write-Host "`n=== AI Finance Tracker Setup Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
}

# Check backend .env
Write-Host "`nChecking backend configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "✓ backend/.env exists" -ForegroundColor Green
    
    $backendEnv = Get-Content "backend\.env" -Raw
    if ($backendEnv -match "SUPABASE_URL=https://") {
        Write-Host "✓ SUPABASE_URL is set" -ForegroundColor Green
    } else {
        Write-Host "✗ SUPABASE_URL not configured" -ForegroundColor Red
    }
    
    if ($backendEnv -match "SUPABASE_ANON_KEY=eyJ") {
        Write-Host "✓ SUPABASE_ANON_KEY is set" -ForegroundColor Green
    } else {
        Write-Host "✗ SUPABASE_ANON_KEY not configured" -ForegroundColor Red
    }
} else {
    Write-Host "✗ backend/.env missing" -ForegroundColor Red
    Write-Host "  Run: cd backend; cp .env.example .env" -ForegroundColor Yellow
}

# Check frontend .env
Write-Host "`nChecking frontend configuration..." -ForegroundColor Yellow
if (Test-Path "frontend\.env") {
    Write-Host "✓ frontend/.env exists" -ForegroundColor Green
    
    $frontendEnv = Get-Content "frontend\.env" -Raw
    if ($frontendEnv -match "VITE_API_URL=http://localhost:5000") {
        Write-Host "✓ VITE_API_URL is set correctly" -ForegroundColor Green
    } else {
        Write-Host "✗ VITE_API_URL not configured correctly" -ForegroundColor Red
    }
    
    if ($frontendEnv -match "VITE_SUPABASE_URL=https://") {
        Write-Host "✓ VITE_SUPABASE_URL is set" -ForegroundColor Green
    } else {
        Write-Host "✗ VITE_SUPABASE_URL not configured" -ForegroundColor Red
    }
    
    if ($frontendEnv -match "VITE_SUPABASE_ANON_KEY=eyJ") {
        Write-Host "✓ VITE_SUPABASE_ANON_KEY is set" -ForegroundColor Green
    } else {
        Write-Host "✗ VITE_SUPABASE_ANON_KEY not configured" -ForegroundColor Red
    }
} else {
    Write-Host "✗ frontend/.env missing" -ForegroundColor Red
    Write-Host "  Run: cd frontend; cp .env.example .env" -ForegroundColor Yellow
}

# Check if backend is running
Write-Host "`nChecking if backend is running..." -ForegroundColor Yellow
$backendRunning = netstat -ano | Select-String ":5000.*LISTENING"
if ($backendRunning) {
    Write-Host "✓ Backend is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "✗ Backend is not running" -ForegroundColor Red
    Write-Host "  Start it: cd backend; npm run dev" -ForegroundColor Yellow
}

# Check if frontend is running
Write-Host "`nChecking if frontend is running..." -ForegroundColor Yellow
$frontend3000 = netstat -ano | Select-String ":3000.*LISTENING"
$frontend5173 = netstat -ano | Select-String ":5173.*LISTENING"
if ($frontend3000) {
    Write-Host "✓ Frontend is running on port 3000" -ForegroundColor Green
} elseif ($frontend5173) {
    Write-Host "✓ Frontend is running on port 5173" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend is not running" -ForegroundColor Red
    Write-Host "  Start it: cd frontend; npm run dev" -ForegroundColor Yellow
}

# Check backend dependencies
Write-Host "`nChecking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend dependencies not installed" -ForegroundColor Red
    Write-Host "  Run: cd backend; npm install" -ForegroundColor Yellow
}

# Check frontend dependencies
Write-Host "`nChecking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "  Run: cd frontend; npm install" -ForegroundColor Yellow
}

# Test backend health endpoint
Write-Host "`nTesting backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend health check passed" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        if ($json.database.connected) {
            Write-Host "✓ Database is connected" -ForegroundColor Green
        } else {
            Write-Host "✗ Database is not connected" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Cannot reach backend health endpoint" -ForegroundColor Red
    Write-Host "  Make sure backend is running: cd backend; npm run dev" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Fix any ✗ issues shown above" -ForegroundColor White
Write-Host "2. Start backend: cd backend; npm run dev" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "4. Open browser to frontend URL" -ForegroundColor White
Write-Host "5. Login and test" -ForegroundColor White
Write-Host ""
