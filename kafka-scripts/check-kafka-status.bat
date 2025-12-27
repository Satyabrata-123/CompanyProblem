@echo off
echo ========================================
echo Kafka Status Check
echo ========================================
echo.

cd C:\kafka

echo === Checking Kafka Connection ===
bin\windows\kafka-broker-api-versions.bat --bootstrap-server localhost:9092 2>nul
if errorlevel 1 (
    echo ❌ Kafka is NOT running on localhost:9092
    echo Please start Kafka first!
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Kafka is running on localhost:9092
)

echo.
echo === Topics ===
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

echo.
echo === Topic Details ===
bin\windows\kafka-topics.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic 2>nul

bin\windows\kafka-topics.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --topic ai-comparison-result-topic 2>nul

echo.
echo === Consumer Groups ===
bin\windows\kafka-consumer-groups.bat --list --bootstrap-server localhost:9092

echo.
echo === Consumer Group Details ===
bin\windows\kafka-consumer-groups.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --group idea-service-group 2>nul

bin\windows\kafka-consumer-groups.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --group ai-service-group 2>nul

bin\windows\kafka-consumer-groups.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --group chatmodel-service-group 2>nul

echo.
echo ========================================
echo Status Check Complete
echo ========================================
pause
