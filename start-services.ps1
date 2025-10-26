Write-Host "Starting Innovation Platform Services..." -ForegroundColor Green
Write-Host ""

Write-Host "Building all services..." -ForegroundColor Yellow
$buildResult = & mvn clean install -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check the errors above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting services in separate windows..." -ForegroundColor Yellow

Write-Host "Starting API Gateway (Port 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Idea Service (Port 8081)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd idea-service; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting User Service (Port 8082)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd user-service; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Voting Service (Port 8083)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd voting-service; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting Gamification Service (Port 8084)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gamification-service; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "Starting AI Service (Port 8085)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-service; mvn spring-boot:run" -WindowStyle Normal

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Wait for all services to fully start before testing the application." -ForegroundColor Yellow
Write-Host "The frontend should be accessible at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "The API Gateway is at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"