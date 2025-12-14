@echo off
echo 🚀 Starting Innovation Platform Services...
echo.

REM Set colors for better visibility
color 0A

echo 📋 Service Startup Order:
echo    1. Eureka Discovery Server (8761)
echo    2. User Service (8082)
echo    3. Idea Service (8081)
echo    4. Voting Service (8083)
echo    5. Gamification Service (8084)
echo    6. AI Service (8085)
echo    7. Company Service (8086)
echo    8. API Gateway (8080)
echo    9. Frontend (3000)
echo.

REM Start Eureka Discovery Server
echo 🔍 Starting Eureka Discovery Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 15 /nobreak > nul

REM Start User Service
echo 👥 Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start Idea Service
echo 💡 Starting Idea Service...
start "Idea Service" cmd /k "cd idea-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start Voting Service
echo 🗳️ Starting Voting Service...
start "Voting Service" cmd /k "cd voting-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start Gamification Service
echo 🎮 Starting Gamification Service...
start "Gamification Service" cmd /k "cd gamification-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start AI Service
echo 🤖 Starting AI Service...
start "AI Service" cmd /k "cd ai-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start Company Service
echo 🏢 Starting Company Service...
start "Company Service" cmd /k "cd company-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

REM Start API Gateway
echo 🌐 Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 15 /nobreak > nul

REM Start Frontend
echo 🎨 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ All services are starting up!
echo.
echo 🌍 Access Points:
echo    Frontend: http://localhost:3000
echo    API Gateway: http://localhost:8080
echo    Eureka Dashboard: http://localhost:8761
echo.
echo 📝 Test URLs:
echo    Challenges: http://localhost:3000/#/challenges
echo    Submit Idea: http://localhost:3000/#/challenges/11111111-1111-1111-1111-111111111111
echo.
echo ⏳ Please wait 2-3 minutes for all services to fully start...
echo 🔄 Services will register with Eureka automatically
echo.
pause