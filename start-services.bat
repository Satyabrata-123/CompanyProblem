@echo off
echo Starting Innovation Platform Services...
echo.

echo Building all services...
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Starting services in separate windows...

echo Starting API Gateway (Port 8080)...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 5

echo Starting Idea Service (Port 8081)...
start "Idea Service" cmd /k "cd idea-service && mvn spring-boot:run"
timeout /t 5

echo Starting User Service (Port 8082)...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 5

echo Starting Voting Service (Port 8083)...
start "Voting Service" cmd /k "cd voting-service && mvn spring-boot:run"
timeout /t 5

echo Starting Gamification Service (Port 8084)...
start "Gamification Service" cmd /k "cd gamification-service && mvn spring-boot:run"
timeout /t 5

echo Starting AI Service (Port 8085)...
start "AI Service" cmd /k "cd ai-service && mvn spring-boot:run"
timeout /t 5

echo Starting Company Service (Port 8086)...
start "Company Service" cmd /k "cd company-service && mvn spring-boot:run"

echo.
echo All services are starting...
echo Wait for all services to fully start before testing the application.
echo The frontend should be accessible at: http://localhost:3000
echo The API Gateway is at: http://localhost:8080
echo.
pause