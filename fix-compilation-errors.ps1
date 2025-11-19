Write-Host "Fixing Compilation Errors..." -ForegroundColor Green
Write-Host ""

# Step 1: Clean and build common module first
Write-Host "Step 1: Building common module..." -ForegroundColor Yellow
Set-Location common
$commonBuild = & mvn clean install -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Common module build failed!" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Step 2: Clean and build company-service
Write-Host "Step 2: Building company-service..." -ForegroundColor Yellow
Set-Location company-service
$companyBuild = & mvn clean compile -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Company service build failed!" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Step 3: Build all modules
Write-Host "Step 3: Building all modules..." -ForegroundColor Yellow
$allBuild = & mvn clean install -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Full build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ All compilation errors fixed!" -ForegroundColor Green
Write-Host "You can now start the services with start-services.ps1" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"