# Verify .gitignore files in all services

Write-Host "`n🔍 Verifying .gitignore Setup`n" -ForegroundColor Cyan

$services = @(
    "ai-service",
    "api-gateway", 
    "company-service",
    "eureka",
    "gamification-service",
    "idea-service",
    "user-service",
    "voting-service",
    "common",
    "frontend"
)

$allPresent = $true

Write-Host "📁 Checking .gitignore files:" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $gitignorePath = "$service\.gitignore"
    
    if (Test-Path $gitignorePath) {
        $fileSize = (Get-Item $gitignorePath).Length
        Write-Host "  ✅ $service" -ForegroundColor Green -NoNewline
        Write-Host " ($fileSize bytes)" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ $service (missing)" -ForegroundColor Red
        $allPresent = $false
    }
}

Write-Host ""

if ($allPresent) {
    Write-Host "🎉 All .gitignore files are present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "  • Total services: $($services.Count)" -ForegroundColor White
    Write-Host "  • .gitignore files: $($services.Count)" -ForegroundColor White
    Write-Host "  • Coverage: 100%" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚫 What's being ignored:" -ForegroundColor Cyan
    Write-Host "  • Build artifacts (target/, dist/)" -ForegroundColor White
    Write-Host "  • Dependencies (node_modules/)" -ForegroundColor White
    Write-Host "  • IDE files (.idea/, .vscode/)" -ForegroundColor White
    Write-Host "  • Logs (*.log)" -ForegroundColor White
    Write-Host "  • OS files (.DS_Store, Thumbs.db)" -ForegroundColor White
    Write-Host "  • Environment files (.env.local)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review .gitignore files if needed" -ForegroundColor White
    Write-Host "  2. Run: git status --ignored" -ForegroundColor White
    Write-Host "  3. Commit .gitignore files: git add */.gitignore" -ForegroundColor White
    Write-Host "     Then: git commit -m 'Add .gitignore files'" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For more info, see: GITIGNORE_SETUP.md" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some .gitignore files are missing!" -ForegroundColor Yellow
    Write-Host "Run the setup again to create missing files." -ForegroundColor Gray
}

Write-Host ""
