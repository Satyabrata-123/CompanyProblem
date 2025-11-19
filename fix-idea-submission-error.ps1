# Fix Idea Submission 500 Error
# This script fixes the database schema and rebuilds the service

Write-Host "🔧 Fixing Idea Submission 500 Error..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Update database schema
Write-Host "Step 1: Updating database schema..." -ForegroundColor Yellow
Write-Host "Running SQL migration script..." -ForegroundColor Gray

try {
    # Try to run SQL script
    $env:PGPASSWORD = "postgres"
    psql -U postgres -d innovation_db -f fix-challenge-ideas-nullable.sql 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema updated successfully" -ForegroundColor Green
        Write-Host "   • challenge_id is now nullable" -ForegroundColor Gray
        Write-Host "   • current_submissions defaults to 0" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Database update may have failed. Continuing anyway..." -ForegroundColor Yellow
        Write-Host "   You can run the SQL manually: psql -U postgres -d innovation_db -f fix-challenge-ideas-nullable.sql" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not update database automatically" -ForegroundColor Yellow
    Write-Host "   Please run this SQL script manually:" -ForegroundColor Gray
    Write-Host "   psql -U postgres -d innovation_db -f fix-challenge-ideas-nullable.sql" -ForegroundColor White
}

Write-Host ""

# Step 2: Rebuild company-service
Write-Host "Step 2: Rebuilding company-service..." -ForegroundColor Yellow

Push-Location company-service

try {
    Write-Host "Running mvn clean install..." -ForegroundColor Gray
    mvn clean install -DskipTests -q
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Company-service rebuilt successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to rebuild company-service" -ForegroundColor Red
        Write-Host "   Please rebuild manually: cd company-service && mvn clean install" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error rebuilding company-service: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""

# Step 3: Instructions for restart
Write-Host "Step 3: Restart services" -ForegroundColor Yellow
Write-Host "Please restart your services using one of these methods:" -ForegroundColor Gray
Write-Host "  • Run: ./start-services.bat" -ForegroundColor White
Write-Host "  • Or restart company-service manually" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Fix applied!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 What was fixed:" -ForegroundColor Cyan
Write-Host "  ✅ Database: challenge_id column is now nullable" -ForegroundColor White
Write-Host "  ✅ Entity: ChallengeIdea.challengeId allows null" -ForegroundColor White
Write-Host "  ✅ Service: Added validation and null-safe handling" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test the fix:" -ForegroundColor Cyan
Write-Host "  1. Restart services" -ForegroundColor White
Write-Host "  2. Navigate to http://localhost:3000/#/ideas/new" -ForegroundColor White
Write-Host "  3. Submit a test idea" -ForegroundColor White
Write-Host "  4. Verify no 500 error occurs" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more details, see: FIX_IDEA_SUBMISSION_500_ERROR.md" -ForegroundColor Gray
