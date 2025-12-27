@echo off
echo ========================================
echo Starting Kafka Consumer for ChatModel
echo ========================================
echo.

cd ChatModel

echo Checking if dependencies are installed...
call venv\Scripts\activate.bat
pip install kafka-python==2.0.2 --quiet

echo.
echo Starting Kafka consumer...
echo Listening for IdeaSubmittedEvent on topic: idea-submitted-topic
echo.
echo Make sure:
echo   1. Kafka is running (run kafka-scripts\start-kafka-kraft.bat)
echo   2. ChatModel service is running (run start-with-chat.bat)
echo   3. Topics are created (run kafka-scripts\create-topics.bat)
echo.

python kafka_consumer.py

pause
