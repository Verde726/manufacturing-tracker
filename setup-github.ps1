# GitHub Repository Setup Script
# Run this after creating a GitHub repository

# Instructions:
# 1. Go to https://github.com/new
# 2. Create repository named "manufacturing-tracker"
# 3. Don't initialize with README
# 4. Copy the repository URL
# 5. Replace YOUR_USERNAME below with your GitHub username
# 6. Run this script in PowerShell

$repoUrl = "https://github.com/YOUR_USERNAME/manufacturing-tracker.git"

Write-Host "Setting up GitHub repository for manufacturing-tracker..." -ForegroundColor Green

# Change to project directory
Set-Location "C:\Users\green\CascadeProjects\manufacturing-tracker"

# Add remote origin
git remote add origin $repoUrl

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main

Write-Host "✅ Repository pushed to GitHub!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign in with GitHub" -ForegroundColor White
Write-Host "3. Click 'New Project'" -ForegroundColor White
Write-Host "4. Import your manufacturing-tracker repository" -ForegroundColor White
Write-Host "5. Click 'Deploy'" -ForegroundColor White