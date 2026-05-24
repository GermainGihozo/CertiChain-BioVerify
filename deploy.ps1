# CertiChain Deployment Script for Windows PowerShell
# This script helps deploy the application to Vercel

Write-Host "🚀 CertiChain Deployment Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Menu
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Deploy Backend" -ForegroundColor White
Write-Host "2. Deploy Frontend" -ForegroundColor White
Write-Host "3. Deploy Both (Backend first, then Frontend)" -ForegroundColor White
Write-Host "4. View Backend Logs" -ForegroundColor White
Write-Host "5. View Frontend Logs" -ForegroundColor White
Write-Host "6. List Environment Variables" -ForegroundColor White
Write-Host "7. Create Admin User (Local with Production DB)" -ForegroundColor White
Write-Host "8. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-8)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📦 Deploying Backend..." -ForegroundColor Cyan
        Set-Location backend
        vercel --prod
        Set-Location ..
        Write-Host "✅ Backend deployment complete!" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "📦 Deploying Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        vercel --prod
        Set-Location ..
        Write-Host "✅ Frontend deployment complete!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📦 Deploying Backend first..." -ForegroundColor Cyan
        Set-Location backend
        vercel --prod
        Set-Location ..
        Write-Host "✅ Backend deployed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Now deploying Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        vercel --prod
        Set-Location ..
        Write-Host "✅ Both deployments complete!" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "📋 Backend Logs:" -ForegroundColor Cyan
        vercel logs certchain-backend --prod
    }
    "5" {
        Write-Host ""
        Write-Host "📋 Frontend Logs:" -ForegroundColor Cyan
        vercel logs certchain-frontend --prod
    }
    "6" {
        Write-Host ""
        Write-Host "🔐 Environment Variables:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend:" -ForegroundColor Yellow
        Set-Location backend
        vercel env ls
        Set-Location ..
        Write-Host ""
        Write-Host "Frontend:" -ForegroundColor Yellow
        Set-Location frontend
        vercel env ls
        Set-Location ..
    }
    "7" {
        Write-Host ""
        Write-Host "👤 Creating Admin User..." -ForegroundColor Cyan
        $mongoUri = Read-Host "Enter MongoDB URI (or press Enter to use default)"
        if ([string]::IsNullOrWhiteSpace($mongoUri)) {
            $mongoUri = "mongodb+srv://gihozondahayogermain_db_user:Germain123@cluster0.rsjqk4w.mongodb.net/certchain?retryWrites=true&w=majority"
        }
        
        $env:MONGODB_URI = $mongoUri
        Set-Location backend
        node scripts/create-admin.js
        Set-Location ..
        Remove-Item Env:\MONGODB_URI
        Write-Host "✅ Admin user creation complete!" -ForegroundColor Green
    }
    "8" {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
