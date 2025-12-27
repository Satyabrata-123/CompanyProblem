@echo off
echo ========================================
echo Format Kafka Storage (KRaft Mode)
echo ========================================
echo.

cd C:\kafka

echo Generating Cluster ID...
for /f "delims=" %%i in ('bin\windows\kafka-storage.bat random-uuid') do set CLUSTER_ID=%%i

echo.
echo Cluster ID: %CLUSTER_ID%
echo.
echo Formatting storage with KRaft mode...
echo.

bin\windows\kafka-storage.bat format ^
  -t %CLUSTER_ID% ^
  -c config\kraft\server.properties

if errorlevel 1 (
    echo.
    echo ERROR: Failed to format storage!
    echo.
    echo Make sure:
    echo 1. Kafka is installed at C:\kafka
    echo 2. config\kraft\server.properties exists
    echo 3. No Kafka instance is running
    pause
    exit /b 1
)

echo.
echo ========================================
echo Storage Formatted Successfully!
echo ========================================
echo.
echo Cluster ID: %CLUSTER_ID%
echo Storage Location: C:\kafka\kraft-combined-logs
echo.
echo Next step: Run start-kafka-kraft.bat
echo.
pause
