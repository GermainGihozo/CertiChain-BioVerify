# Simple Monorepo Deployment Script
Write-Host "🚀 Deploying CertiChain-BioVerify to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Get project URL
Write-Host "Enter your Vercel project URL:" -ForegroundColor Yellow
Write-Host "(e.g., https://chaincertificateverify.vercel.app)" -ForegroundColor Gray
$projectUrl = Read-Host "URL"

if (-not $projectUrl) {
    Write-Host "Error: URL is required!" -ForegroundColor Red
    exit 1
}

$projectUrl = $projectUrl.TrimEnd('/')
$rpId = $projectUrl -replace 'https?://', ''

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  URL: $projectUrl" -ForegroundColor White
Write-Host "  RP ID: $rpId" -ForegroundColor White
Write-Host ""

# Deploy
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Vercel Dashboard" -ForegroundColor White
    Write-Host "2. Settings → Environment Variables" -ForegroundColor White
    Write-Host "3. Add these variables for Production:" -ForegroundColor White
    Write-Host ""
    Write-Host "   MONGODB_URI=mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority" -ForegroundColor Gray
    Write-Host "   JWT_SECRET=your-secret-key" -ForegroundColor Gray
    Write-Host "   WEBAUTHN_RP_NAME=CertChain" -ForegroundColor Gray
    Write-Host "   WEBAUTHN_RP_ID=$rpId" -ForegroundColor Gray
    Write-Host "   WEBAUTHN_ORIGIN=$projectUrl" -ForegroundColor Gray
    Write-Host "   NODE_ENV=production" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Redeploy after adding variables" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app: $projectUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}
