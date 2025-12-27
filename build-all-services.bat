@echo off
echo ========================================
echo Building All Services
echo ========================================
echo.

echo This will build all microservices in the correct order.
echo.

REM Build common module first (required by other services)
echo [1/8] Building Common Module...
cd common
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build common module!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build Eureka
echo.
echo [2/8] Building Eureka Service...
cd eureka
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build eureka!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build API Gateway
echo.
echo [3/8] Building API Gateway...
cd api-gateway
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build api-gateway!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build Idea Service
echo.
echo [4/8] Building Idea Service...
cd idea-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build idea-service!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build User Service
echo.
echo [5/8] Building User Service...
cd user-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build user-service!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build Company Service
echo.
echo [6/8] Building Company Service...
cd company-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build company-service!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build AI Service
echo.
echo [7/8] Building AI Service...
cd ai-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build ai-service!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Build Gamification Service
echo.
echo [8/8] Building Gamification Service...
cd gamification-service
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build gamification-service!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo All Services Built Successfully!
echo ========================================
echo.
echo You can now start the services with:
echo   start-all-services.bat
echo.
echo Or start with Kafka:
echo   start-all-with-kafka.bat
echo.
pause
