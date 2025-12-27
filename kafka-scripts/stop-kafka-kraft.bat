@echo off
echo ========================================
echo Stopping Kafka (KRaft Mode)
echo ========================================
echo.

cd C:\kafka

echo Stopping Kafka Server...
bin\windows\kafka-server-stop.bat

echo.
echo ========================================
echo Kafka Stopped
echo ========================================
echo.
echo You can now close the Kafka terminal window
pause
