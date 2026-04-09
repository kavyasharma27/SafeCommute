# Quick Git Push Script for SafeCommute

# Step 1: Initialize git (if not done)
Write-Host "🚀 SafeCommute - GitHub Deployment Script" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Step 2: Add all files
Write-Host "`n📝 Adding all files to git..." -ForegroundColor Yellow
git add .

# Step 3: Commit
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "SafeCommute app ready for deployment"
}
git commit -m "$commitMessage"

# Step 4: Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (!$remoteExists) {
    Write-Host "`n🔗 Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/kavyasharma27/SafeCommute.git
} else {
    Write-Host "`n✅ GitHub remote already configured" -ForegroundColor Green
}

# Step 5: Set main branch
Write-Host "`n🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main

# Step 6: Push to GitHub
Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  You may need to enter your GitHub credentials" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "`n📱 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/kavyasharma27/SafeCommute" -ForegroundColor White
Write-Host "2. Deploy frontend to Netlify: https://app.netlify.com" -ForegroundColor White
Write-Host "3. Deploy backend to Render: https://render.com" -ForegroundColor White
Write-Host "`nSee DEPLOYMENT.md for detailed instructions!" -ForegroundColor Yellow
