# Monorepo Deployment Script for Vercel
# Deploys both frontend and backend as a single project

Write-Host "🚀 CertiChain-BioVerify Monorepo Deployment" -ForegroundColor Cyan
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

# Get project URL
Write-Host "🌐 Enter your Vercel project URL:" -ForegroundColor Yellow
$projectUrl = Read-Host "Project URL (e.g., https://your-project.vercel.app)"
Write-Host ""

# Validate URL
if (-not $projectUrl) {
    Write-Host "❌ Project URL is required!" -ForegroundColor Red
    exit 1
}

# Remove trailing slash
$projectUrl = $projectUrl.TrimEnd('/')

# Extract domain for RP_ID
$rpId = $projectUrl -replace 'https?://', ''

Write-Host "📝 Configuration:" -ForegroundColor Cyan
Write-Host "  Project URL: $projectUrl" -ForegroundColor White
Write-Host "  RP ID: $rpId" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}
Write-Host ""

# Check if vercel.json exists
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ vercel.json not found in root directory!" -ForegroundColor Red
    Write-Host "   Please ensure vercel.json exists for monorepo deployment" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ vercel.json found" -ForegroundColor Green
Write-Host ""

# Check if frontend/.env.production exists
if (-not (Test-Path "frontend\.env.production")) {
    Write-Host "⚠️  frontend/.env.production not found" -ForegroundColor Yellow
    Write-Host "   Creating it now..." -ForegroundColor Gray
    
    $envContent = @"
# Production Environment Variables
# For monorepo deployment where frontend and backend are on same domain

# API URL - Use relative path since both are on same domain
REACT_APP_API_URL=/api

# Contract Address
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
"@
    
    Set-Content -Path "frontend\.env.production" -Value $envContent
    Write-Host "✅ frontend/.env.production created" -ForegroundColor Green
}
Write-Host ""

# Set environment variables
Write-Host "🔐 Setting Environment Variables..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$envVars = vercel env ls 2>&1

# MONGODB_URI
Write-Host "📋 MONGODB_URI..." -ForegroundColor Yellow
if ($envVars -match "MONGODB_URI") {
    Write-Host "  ✅ Already set" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Not set. Please add it manually in Vercel dashboard" -ForegroundColor Yellow
    Write-Host "     Go to: Settings → Environment Variables" -ForegroundColor Gray
}

# JWT_SECRET
Write-Host "📋 JWT_SECRET..." -ForegroundColor Yellow
if ($envVars -match "JWT_SECRET") {
    Write-Host "  ✅ Already set" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Not set. Please add it manually in Vercel dashboard" -ForegroundColor Yellow
}

# WEBAUTHN_RP_NAME
Write-Host "🔐 Setting WEBAUTHN_RP_NAME..." -ForegroundColor Yellow
if ($envVars -match "WEBAUTHN_RP_NAME") {
    vercel env rm WEBAUTHN_RP_NAME production --yes 2>&1 | Out-Null
}
Write-Host "CertChain" | vercel env add WEBAUTHN_RP_NAME production 2>&1 | Out-Null
Write-Host "  ✅ WEBAUTHN_RP_NAME set" -ForegroundColor Green

# WEBAUTHN_RP_ID
Write-Host "🔐 Setting WEBAUTHN_RP_ID..." -ForegroundColor Yellow
if ($envVars -match "WEBAUTHN_RP_ID") {
    vercel env rm WEBAUTHN_RP_ID production --yes 2>&1 | Out-Null
}
Write-Host $rpId | vercel env add WEBAUTHN_RP_ID production 2>&1 | Out-Null
Write-Host "  ✅ WEBAUTHN_RP_ID set to $rpId" -ForegroundColor Green

# WEBAUTHN_ORIGIN
Write-Host "🔐 Setting WEBAUTHN_ORIGIN..." -ForegroundColor Yellow
if ($envVars -match "WEBAUTHN_ORIGIN") {
    vercel env rm WEBAUTHN_ORIGIN production --yes 2>&1 | Out-Null
}
Write-Host $projectUrl | vercel env add WEBAUTHN_ORIGIN production 2>&1 | Out-Null
Write-Host "  ✅ WEBAUTHN_ORIGIN set" -ForegroundColor Green

# NODE_ENV
Write-Host "🔐 Setting NODE_ENV..." -ForegroundColor Yellow
if ($envVars -match "NODE_ENV") {
    vercel env rm NODE_ENV production --yes 2>&1 | Out-Null
}
Write-Host "production" | vercel env add NODE_ENV production 2>&1 | Out-Null
Write-Host "  ✅ NODE_ENV set" -ForegroundColor Green

Write-Host ""

# Deploy
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Test deployment
    Write-Host "🔍 Testing Deployment..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Testing health check..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$projectUrl/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Health check failed: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Testing frontend..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $projectUrl -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is accessible" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Frontend check failed: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  Project URL: $projectUrl" -ForegroundColor White
    Write-Host "  Frontend: $projectUrl" -ForegroundColor White
    Write-Host "  Backend API: $projectUrl/api" -ForegroundColor White
    Write-Host "  Health Check: $projectUrl/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Environment Variables Set:" -ForegroundColor Cyan
    Write-Host "  - WEBAUTHN_RP_NAME = CertChain" -ForegroundColor Gray
    Write-Host "  - WEBAUTHN_RP_ID = $rpId" -ForegroundColor Gray
    Write-Host "  - WEBAUTHN_ORIGIN = $projectUrl" -ForegroundColor Gray
    Write-Host "  - NODE_ENV = production" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Don't forget to set these manually in Vercel dashboard:" -ForegroundColor Yellow
    Write-Host "  - MONGODB_URI" -ForegroundColor White
    Write-Host "  - JWT_SECRET" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Set MONGODB_URI and JWT_SECRET in Vercel dashboard" -ForegroundColor White
    Write-Host "  2. Redeploy after setting variables" -ForegroundColor White
    Write-Host "  3. Open $projectUrl in your browser" -ForegroundColor White
    Write-Host "  4. Try to register/login" -ForegroundColor White
    Write-Host "  5. Test all features" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Deployment script completed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
