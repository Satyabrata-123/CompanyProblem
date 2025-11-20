# Automatic cleanup of unnecessary files

Write-Host "`n🧹 Automatic Project Cleanup`n" -ForegroundColor Cyan

# Files to delete
$filesToDelete = @(
    # Test HTML files (root)
    "test-ai-idea-solution-comparison.html",
    "test-all-idea-submission-entry-points.html",
    "test-backend.html",
    "test-challenge-creation.html",
    "test-company-dashboard-challenges.html",
    "test-complete-system.html",
    "test-dashboard-company-button.html",
    "test-idea-submission-flow.html",
    "test-ideas-new-page.html",
    "test-services.html",
    "test-login-required.html",
    "test-dashboard-idea-submission.html",
    
    # Test HTML files (frontend)
    "frontend/test-company-pages.html",
    "frontend/test-company-verification.html",
    "frontend/test-create-challenge.html",
    "frontend/test-page-syntax.html",
    "frontend/test-router.html",
    
    # Debug HTML files
    "frontend/debug-api.html",
    "frontend/debug-challenge-creation.html",
    
    # Fix scripts (already applied)
    "fix-boolean-columns.sql",
    "fix-existing-company.sql",
    "fix-company-verification.sql",
    "fix-your-company.html",
    "fix-challenge-ideas-nullable.sql",
    "fix-idea-submission-error.ps1",
    "setup-verified-company.ps1",
    "setup-test-data.sql",
    
    # Old/redundant documentation
    "BOOLEAN_STORAGE_ISSUE_EXPLAINED.md",
    "CHALLENGE_CREATION_TROUBLESHOOTING.md",
    "DASHBOARD_WITH_SUBMIT_BUTTONS.md",
    "COMPANY_DASHBOARD_TABLE_LAYOUT.md",
    "DASHBOARD_CHALLENGES_FIX.md",
    "FIX_IDEA_SUBMISSION_500_ERROR.md",
    "DASHBOARD_IDEA_SUBMISSION_LOGIN.md",
    "LOGIN_INTEGRATION_SUMMARY.md",
    
    # Duplicate files
    "frontend/src/pages/ideas/ideas-list-fixed.js"
)

$deleted = 0
$notFound = 0
$failed = 0

Write-Host "Deleting unnecessary files...`n" -ForegroundColor Yellow

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "❌ Failed: $file" -ForegroundColor Red
            $failed++
        }
    } else {
        $notFound++
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Deleted: $deleted files" -ForegroundColor Green
Write-Host "  ⚠️  Not found: $notFound files" -ForegroundColor Gray
Write-Host "  ❌ Failed: $failed files" -ForegroundColor Red
Write-Host "  📦 Total processed: $($filesToDelete.Count) files" -ForegroundColor White

if ($deleted -gt 0) {
    Write-Host "`n✨ Project cleaned up successfully!" -ForegroundColor Green
}

Write-Host "`nKept important files: Documentation, database setup, startup scripts, source code" -ForegroundColor Cyan
Write-Host ""
