# AI Finance Tracker - Deployment Script
# This script helps verify your deployment setup

Write-Host "🚀 AI Finance Tracker - Deployment Verification" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project directory verified" -ForegroundColor Green
Write-Host ""

# Check Git status
Write-Host "📦 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Deployment cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Git working directory is clean" -ForegroundColor Green
}
Write-Host ""

# Check if latest changes are pushed
Write-Host "🔄 Checking if changes are pushed..." -ForegroundColor Yellow
$unpushed = git log origin/main..HEAD --oneline
if ($unpushed) {
    Write-Host "⚠️  Warning: You have unpushed commits:" -ForegroundColor Yellow
    Write-Host $unpushed
    Write-Host ""
    $push = Read-Host "Push now? (y/n)"
    if ($push -eq "y") {
        git push origin main
        Write-Host "✓ Changes pushed to remote" -ForegroundColor Green
    }
} else {
    Write-Host "✓ All changes are pushed" -ForegroundColor Green
}
Write-Host ""

# Check backend dependencies
Write-Host "📚 Checking backend dependencies..." -ForegroundColor Yellow
Push-Location backend
if (Test-Path "node_modules") {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check for required packages
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredPackages = @("openai", "@anthropic-ai/sdk", "express", "dotenv")
$missingPackages = @()

foreach ($pkg in $requiredPackages) {
    if (-not $packageJson.dependencies.$pkg) {
        $missingPackages += $pkg
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "❌ Missing required packages: $($missingPackages -join ', ')" -ForegroundColor Red
    Write-Host "Run: npm install $($missingPackages -join ' ')" -ForegroundColor Yellow
} else {
    Write-Host "✓ All required backend packages installed" -ForegroundColor Green
}

# Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host ""

# Check frontend dependencies
Write-Host "📚 Checking frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
if (Test-Path "node_modules") {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host ""

# Check environment variables
Write-Host "🔐 Checking environment variables..." -ForegroundColor Yellow
Write-Host ""

$envVars = @{
    "Backend" = @(
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_KEY",
        "JWT_SECRET",
        "AI_PROVIDER",
        "OPENAI_API_KEY or ANTHROPIC_API_KEY"
    )
    "Frontend" = @(
        "VITE_API_URL",
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY"
    )
}

Write-Host "Required Environment Variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (.env):" -ForegroundColor Yellow
foreach ($var in $envVars["Backend"]) {
    Write-Host "  - $var" -ForegroundColor White
}
Write-Host ""
Write-Host "Frontend (.env.production):" -ForegroundColor Yellow
foreach ($var in $envVars["Frontend"]) {
    Write-Host "  - $var" -ForegroundColor White
}
Write-Host ""

# Deployment options
Write-Host "🌐 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Deployment:" -ForegroundColor Yellow
Write-Host "  1. Render.com - https://render.com" -ForegroundColor White
Write-Host "  2. Fly.io - https://fly.io" -ForegroundColor White
Write-Host "  3. Railway - https://railway.app" -ForegroundColor White
Write-Host ""
Write-Host "Frontend Deployment:" -ForegroundColor Yellow
Write-Host "  1. Netlify - https://netlify.com" -ForegroundColor White
Write-Host "  2. Vercel - https://vercel.com" -ForegroundColor White
Write-Host "  3. Cloudflare Pages - https://pages.cloudflare.com" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "✅ Pre-Deployment Checklist Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up your deployment platform accounts" -ForegroundColor White
Write-Host "2. Configure environment variables on your platform" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Deploy backend first, then frontend" -ForegroundColor White
Write-Host "5. Update Supabase redirect URLs" -ForegroundColor White
Write-Host "6. Test the deployed application" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open deployment guide
$openGuide = Read-Host "Open deployment guide? (y/n)"
if ($openGuide -eq "y") {
    Start-Process "DEPLOYMENT_GUIDE.md"
}

Write-Host ""
Write-Host "🎉 Ready to deploy! Good luck!" -ForegroundColor Green
