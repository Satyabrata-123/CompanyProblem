@echo off
echo ========================================
echo Starting Complete Innovation Platform
echo ========================================
echo.
echo This will start:
echo   1. Kafka (KRaft mode)
echo   2. All microservices
echo   3. ChatModel service
echo   4. Kafka consumer for AI comparison
echo.
echo Press Ctrl+C to cancel, or
pause

REM Start Kafka
echo.
echo [1/4] Starting Kafka...
start "Kafka Server" cmd /k "cd kafka-scripts && start-kafka-kraft.bat"
timeout /t 10 /nobreak

REM Create topics
echo.
echo [2/4] Creating Kafka topics...
call kafka-scripts\create-topics.bat
timeout /t 5 /nobreak

REM Start all services
echo.
echo [3/4] Starting all microservices...
start "All Services" cmd /k "start-all-services.bat"
timeout /t 30 /nobreak

REM Start ChatModel
echo.
echo [4/4] Starting ChatModel service...
start "ChatModel Service" cmd /k "cd ChatModel && start_service.bat"
timeout /t 10 /nobreak

REM Start Kafka Consumer
echo.
echo [5/5] Starting Kafka Consumer...
start "Kafka Consumer" cmd /k "start-kafka-consumer.bat"

echo.
echo ========================================
echo System Startup Complete!
echo ========================================
echo.
echo Services running:
echo   - Kafka: localhost:9092
echo   - Eureka: http://localhost:8761
echo   - Company Service: http://localhost:8081
echo   - User Service: http://localhost:8082
echo   - Idea Service: http://localhost:8083
echo   - Gamification Service: http://localhost:8084
echo   - AI Service: http://localhost:8085
echo   - ChatModel: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.
echo Kafka Consumer is listening for idea submissions
echo and will automatically trigger AI comparisons.
echo.
echo Check individual windows for service logs.
echo.
pause
