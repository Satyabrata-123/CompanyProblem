@echo off
echo ========================================
echo Starting All Microservices
echo ========================================
echo.

REM Start Eureka
echo [1/8] Starting Eureka Service...
start "Eureka" cmd /k "cd eureka && mvn spring-boot:run"
timeout /t 15 /nobreak

REM Start API Gateway
echo.
echo [2/8] Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start Company Service
echo.
echo [3/8] Starting Company Service...
start "Company Service" cmd /k "cd company-service && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start User Service
echo.
echo [4/8] Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start Idea Service
echo.
echo [5/8] Starting Idea Service...
start "Idea Service" cmd /k "cd idea-service && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start Gamification Service
echo.
echo [6/8] Starting Gamification Service...
start "Gamification Service" cmd /k "cd gamification-service && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start AI Service
echo.
echo [7/8] Starting AI Service...
start "AI Service" cmd /k "cd ai-service && mvn spring-boot:run"
timeout /t 10 /nobreak

REM Start Voting Service
echo.
echo [8/8] Starting Voting Service...
start "Voting Service" cmd /k "cd voting-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Services:
echo   - Eureka: http://localhost:8761
echo   - API Gateway: http://localhost:8080
echo   - Idea Service: http://localhost:8081
echo   - User Service: http://localhost:8082
echo   - Voting Service: http://localhost:8083
echo   - Gamification Service: http://localhost:8084
echo   - AI Service: http://localhost:8085
echo   - Company Service: http://localhost:8086
echo.
echo Check individual windows for service logs.
echo.
pause
