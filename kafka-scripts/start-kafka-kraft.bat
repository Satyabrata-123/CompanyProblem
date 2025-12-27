@echo off
echo ========================================
echo Starting Kafka (KRaft Mode - No Zookeeper!)
echo ========================================
echo.

REM Check if Kafka is installed
if not exist "C:\kafka\bin\windows\kafka-server-start.bat" (
    echo ERROR: Kafka not found at C:\kafka
    echo.
    echo Please install Kafka:
    echo 1. Download from https://kafka.apache.org/downloads
    echo 2. Extract to C:\kafka
    echo.
    pause
    exit /b 1
)

REM Check if storage is formatted
if not exist "C:\kafka\kraft-combined-logs\meta.properties" (
    echo ERROR: Kafka storage not formatted!
    echo.
    echo Please run format-kafka-storage.bat first
    echo.
    pause
    exit /b 1
)

echo Starting Kafka Server (KRaft mode)...
echo Port: 9092 (Client connections)
echo Port: 9093 (Controller)
echo.
echo NO ZOOKEEPER NEEDED! ✅
echo.
echo Keep this window open!
echo.

cd C:\kafka
bin\windows\kafka-server-start.bat config\kraft\server.properties
