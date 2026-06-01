# Production Deployment Script for CertiChain-BioVerify
# This script helps deploy both backend and frontend to Vercel with proper configuration

Write-Host "🚀 CertiChain-BioVerify Production Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}
Write-Host ""

# Get deployment URLs
Write-Host "🌐 Enter your deployment URLs:" -ForegroundColor Yellow
$frontendUrl = Read-Host "Frontend URL (e.g., https://chaincertificateverify.vercel.app)"
$backendUrl = Read-Host "Backend URL (e.g., https://certchain-backend-five.vercel.app)"
Write-Host ""

# Validate URLs
if (-not $frontendUrl -or -not $backendUrl) {
    Write-Host "❌ Both URLs are required!" -ForegroundColor Red
    exit 1
}

# Remove trailing slashes
$frontendUrl = $frontendUrl.TrimEnd('/')
$backendUrl = $backendUrl.TrimEnd('/')

Write-Host "📝 Configuration:" -ForegroundColor Cyan
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host "  Backend:  $backendUrl" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}
Write-Host ""

# ============================================
# BACKEND DEPLOYMENT
# ============================================

Write-Host "🔧 Deploying Backend..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Set-Location backend

# Check if environment variables exist
Write-Host "📋 Checking environment variables..." -ForegroundColor Yellow
$envVars = vercel env ls 2>&1

# Set FRONTEND_URL
Write-Host "🔐 Setting FRONTEND_URL..." -ForegroundColor Yellow
if ($envVars -match "FRONTEND_URL") {
    Write-Host "  Removing existing FRONTEND_URL..." -ForegroundColor Gray
    vercel env rm FRONTEND_URL production --yes 2>&1 | Out-Null
}
Write-Host $frontendUrl | vercel env add FRONTEND_URL production 2>&1 | Out-Null
Write-Host "  ✅ FRONTEND_URL set" -ForegroundColor Green

# Set WEBAUTHN_ORIGIN
Write-Host "🔐 Setting WEBAUTHN_ORIGIN..." -ForegroundColor Yellow
if ($envVars -match "WEBAUTHN_ORIGIN") {
    Write-Host "  Removing existing WEBAUTHN_ORIGIN..." -ForegroundColor Gray
    vercel env rm WEBAUTHN_ORIGIN production --yes 2>&1 | Out-Null
}
Write-Host $frontendUrl | vercel env add WEBAUTHN_ORIGIN production 2>&1 | Out-Null
Write-Host "  ✅ WEBAUTHN_ORIGIN set" -ForegroundColor Green

# Set WEBAUTHN_RP_ID
$rpId = $frontendUrl -replace 'https?://', ''
Write-Host "🔐 Setting WEBAUTHN_RP_ID..." -ForegroundColor Yellow
if ($envVars -match "WEBAUTHN_RP_ID") {
    Write-Host "  Removing existing WEBAUTHN_RP_ID..." -ForegroundColor Gray
    vercel env rm WEBAUTHN_RP_ID production --yes 2>&1 | Out-Null
}
Write-Host $rpId | vercel env add WEBAUTHN_RP_ID production 2>&1 | Out-Null
Write-Host "  ✅ WEBAUTHN_RP_ID set to $rpId" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Deploying backend to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# ============================================
# FRONTEND DEPLOYMENT
# ============================================

Write-Host "🎨 Deploying Frontend..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Set-Location frontend

# Check if environment variables exist
Write-Host "📋 Checking environment variables..." -ForegroundColor Yellow
$envVars = vercel env ls 2>&1

# Set REACT_APP_API_URL
Write-Host "🔐 Setting REACT_APP_API_URL..." -ForegroundColor Yellow
if ($envVars -match "REACT_APP_API_URL") {
    Write-Host "  Removing existing REACT_APP_API_URL..." -ForegroundColor Gray
    vercel env rm REACT_APP_API_URL production --yes 2>&1 | Out-Null
}
Write-Host $backendUrl | vercel env add REACT_APP_API_URL production 2>&1 | Out-Null
Write-Host "  ✅ REACT_APP_API_URL set" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# ============================================
# VERIFICATION
# ============================================

Write-Host "🔍 Verifying Deployment..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "Testing backend health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend check failed: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# SUMMARY
# ============================================

Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Frontend URL: $frontendUrl" -ForegroundColor White
Write-Host "  Backend URL:  $backendUrl" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Environment Variables Set:" -ForegroundColor Cyan
Write-Host "  Backend:" -ForegroundColor White
Write-Host "    - FRONTEND_URL = $frontendUrl" -ForegroundColor Gray
Write-Host "    - WEBAUTHN_ORIGIN = $frontendUrl" -ForegroundColor Gray
Write-Host "    - WEBAUTHN_RP_ID = $rpId" -ForegroundColor Gray
Write-Host "  Frontend:" -ForegroundColor White
Write-Host "    - REACT_APP_API_URL = $backendUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open $frontendUrl in your browser" -ForegroundColor White
Write-Host "  2. Try to register/login" -ForegroundColor White
Write-Host "  3. Check browser console for errors (F12)" -ForegroundColor White
Write-Host "  4. Test all features" -ForegroundColor White
Write-Host ""
Write-Host "🐛 If you encounter CORS errors:" -ForegroundColor Yellow
Write-Host "  - Check Vercel dashboard for environment variables" -ForegroundColor White
Write-Host "  - Verify URLs match exactly (no trailing slashes)" -ForegroundColor White
Write-Host "  - Check browser console for specific error messages" -ForegroundColor White
Write-Host "  - See CORS_FIX_GUIDE.md for detailed troubleshooting" -ForegroundColor White
Write-Host ""
Write-Host "✅ Deployment script completed!" -ForegroundColor Green
