@echo off
echo ========================================
echo Creating Kafka Topics
echo ========================================
echo.

cd C:\kafka

echo Creating idea-submitted-topic...
bin\windows\kafka-topics.bat --create ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic ^
  --partitions 3 ^
  --replication-factor 1 ^
  --if-not-exists

if errorlevel 1 (
    echo ERROR: Failed to create idea-submitted-topic
    echo Make sure Kafka is running!
    pause
    exit /b 1
)

echo.
echo Creating ai-comparison-result-topic...
bin\windows\kafka-topics.bat --create ^
  --bootstrap-server localhost:9092 ^
  --topic ai-comparison-result-topic ^
  --partitions 3 ^
  --replication-factor 1 ^
  --if-not-exists 

if errorlevel 1 (
    echo ERROR: Failed to create ai-comparison-result-topic
    pause
    exit /b 1
)

echo.
echo ========================================
echo Topics Created Successfully!
echo ========================================
echo.

echo Listing all topics:
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

echo.
echo Describing idea-submitted-topic:
bin\windows\kafka-topics.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic

echo.
pause
