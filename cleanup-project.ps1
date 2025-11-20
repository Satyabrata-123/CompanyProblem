# Clean up unnecessary files from the project

Write-Host "`n🧹 Project Cleanup Script`n" -ForegroundColor Cyan

# Define categories of files to clean up
$testFiles = @(
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
    "frontend/test-company-pages.html",
    "frontend/test-company-verification.html",
    "frontend/test-create-challenge.html",
    "frontend/test-page-syntax.html",
    "frontend/test-router.html",
    "frontend/debug-api.html",
    "frontend/debug-challenge-creation.html"
)

$fixScripts = @(
    "fix-boolean-columns.sql",
    "fix-existing-company.sql",
    "fix-company-verification.sql",
    "fix-your-company.html",
    "fix-challenge-ideas-nullable.sql",
    "fix-idea-submission-error.ps1",
    "setup-verified-company.ps1",
    "setup-test-data.sql"
)

$oldDocs = @(
    "BOOLEAN_STORAGE_ISSUE_EXPLAINED.md",
    "CHALLENGE_CREATION_TROUBLESHOOTING.md",
    "DASHBOARD_WITH_SUBMIT_BUTTONS.md",
    "COMPANY_DASHBOARD_TABLE_LAYOUT.md",
    "DASHBOARD_CHALLENGES_FIX.md",
    "FIX_IDEA_SUBMISSION_500_ERROR.md",
    "DASHBOARD_IDEA_SUBMISSION_LOGIN.md",
    "LOGIN_INTEGRATION_SUMMARY.md"
)

$duplicateFiles = @(
    "frontend/src/pages/ideas/ideas-list-fixed.js"
)

# Count files
$totalFiles = $testFiles.Count + $fixScripts.Count + $oldDocs.Count + $duplicateFiles.Count

Write-Host "📊 Files to Clean Up:`n" -ForegroundColor Yellow

Write-Host "  🧪 Test Files: $($testFiles.Count)" -ForegroundColor Cyan
Write-Host "  🔧 Fix Scripts: $($fixScripts.Count)" -ForegroundColor Cyan
Write-Host "  📄 Old Documentation: $($oldDocs.Count)" -ForegroundColor Cyan
Write-Host "  📋 Duplicate Files: $($duplicateFiles.Count)" -ForegroundColor Cyan
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  📦 Total: $totalFiles files" -ForegroundColor White

Write-Host "`n❓ What would you like to do?`n" -ForegroundColor Yellow
Write-Host "  1. List all files (no deletion)" -ForegroundColor White
Write-Host "  2. Delete test files only" -ForegroundColor White
Write-Host "  3. Delete fix scripts only" -ForegroundColor White
Write-Host "  4. Delete old documentation only" -ForegroundColor White
Write-Host "  5. Delete ALL unnecessary files" -ForegroundColor Red
Write-Host "  6. Cancel" -ForegroundColor Gray

Write-Host ""
$choice = Read-Host "Enter your choice (1-6)"

function Remove-Files {
    param (
        [string[]]$Files,
        [string]$Category
    )
    
    $deleted = 0
    $notFound = 0
    
    Write-Host "`n🗑️  Deleting $Category..." -ForegroundColor Yellow
    
    foreach ($file in $Files) {
        if (Test-Path $file) {
            try {
                Remove-Item $file -Force
                Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
                $deleted++
            } catch {
                Write-Host "  ❌ Failed to delete: $file" -ForegroundColor Red
            }
        } else {
            Write-Host "  ⚠️  Not found: $file" -ForegroundColor Gray
            $notFound++
        }
    }
    
    Write-Host "`n  Summary: $deleted deleted, $notFound not found" -ForegroundColor Cyan
}

function List-Files {
    param (
        [string[]]$Files,
        [string]$Category
    )
    
    Write-Host "`n📋 $Category" -ForegroundColor Yellow
    
    foreach ($file in $Files) {
        if (Test-Path $file) {
            $size = (Get-Item $file).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "  📄 $file" -ForegroundColor White -NoNewline
            Write-Host " ($sizeKB KB)" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠️  $file (not found)" -ForegroundColor Gray
        }
    }
}

switch ($choice) {
    "1" {
        Write-Host "`n📋 Listing all files...`n" -ForegroundColor Cyan
        List-Files -Files $testFiles -Category "Test Files"
        List-Files -Files $fixScripts -Category "Fix Scripts"
        List-Files -Files $oldDocs -Category "Old Documentation"
        List-Files -Files $duplicateFiles -Category "Duplicate Files"
    }
    "2" {
        Remove-Files -Files $testFiles -Category "Test Files"
    }
    "3" {
        Remove-Files -Files $fixScripts -Category "Fix Scripts"
    }
    "4" {
        Remove-Files -Files $oldDocs -Category "Old Documentation"
    }
    "5" {
        Write-Host "`n⚠️  WARNING: This will delete ALL unnecessary files!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        
        if ($confirm -eq "yes") {
            Remove-Files -Files $testFiles -Category "Test Files"
            Remove-Files -Files $fixScripts -Category "Fix Scripts"
            Remove-Files -Files $oldDocs -Category "Old Documentation"
            Remove-Files -Files $duplicateFiles -Category "Duplicate Files"
            
            Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Cleanup cancelled" -ForegroundColor Yellow
        }
    }
    "6" {
        Write-Host "`n❌ Cleanup cancelled" -ForegroundColor Yellow
    }
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host "`n💡 Tip: Keep important documentation files:" -ForegroundColor Cyan
Write-Host "  • SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  • QUICK_REFERENCE.md" -ForegroundColor White
Write-Host "  • IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host "  • AI_IDEA_SOLUTION_COMPARISON.md" -ForegroundColor White
Write-Host "  • INTEGRATE_AI_COMPARISON_WITH_SUBMISSION.md" -ForegroundColor White
Write-Host "  • GITIGNORE_SETUP.md" -ForegroundColor White
Write-Host "  • TROUBLESHOOTING.md" -ForegroundColor White

Write-Host ""
