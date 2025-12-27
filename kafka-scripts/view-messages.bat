@echo off
echo ========================================
echo View Kafka Messages
echo ========================================
echo.

cd C:\kafka

echo Select topic to view:
echo 1. idea-submitted-topic
echo 2. ai-comparison-result-topic
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    set TOPIC=idea-submitted-topic
) else if "%choice%"=="2" (
    set TOPIC=ai-comparison-result-topic
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo Viewing messages from %TOPIC%...
echo Press Ctrl+C to stop
echo.

bin\windows\kafka-console-consumer.bat ^
  --bootstrap-server localhost:9092 ^
  --topic %TOPIC% ^
  --from-beginning ^
  --property print.timestamp=true ^
  --property print.key=true
