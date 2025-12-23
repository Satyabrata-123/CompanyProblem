@echo off
echo Starting Innovation Platform with Interactive Chat Service...
echo.

REM Start the main platform services
echo Starting backend services...
call start-all-services.bat

REM Wait a moment for services to start
timeout /t 10 /nobreak >nul

REM Start the chat service
echo.
echo Starting Interactive Chat Service...
cd ChatModel
call start_service.bat

echo.
echo All services started!
echo - Backend Platform: http://localhost:3000
echo - Chat Service: http://localhost:5000
echo.
pause