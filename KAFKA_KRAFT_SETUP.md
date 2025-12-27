# Kafka Setup with KRaft Mode (No Zookeeper!)

## What is KRaft Mode?

KRaft (Kafka Raft) is the new Kafka mode that **doesn't need Zookeeper**. It's:
- ✅ Simpler - Only one service to run
- ✅ Faster - Better performance
- ✅ Modern - Kafka's future (Zookeeper is being deprecated)

## Step 1: Download Kafka

1. Download: https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz
2. Extract to: `C:\kafka`

## Step 2: Generate Cluster ID

```cmd
cd C:\kafka

# Generate a unique cluster ID
bin\windows\kafka-storage.bat random-uuid
```

**Save the output!** Example: `MkU3OEVBNTcwNTJENDM2Qk`

## Step 3: Configure Kafka for KRaft Mode

### Edit `C:\kafka\config\kraft\server.properties`

```properties
# Process roles (controller + broker in one)
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@localhost:9093

# Listeners
listeners=PLAINTEXT://localhost:9092,CONTROLLER://localhost:9093
advertised.listeners=PLAINTEXT://localhost:9092
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT

# Log directories
log.dirs=C:/kafka/kraft-combined-logs

# Cluster ID (will be set during format)
# cluster.id=<YOUR_CLUSTER_ID>

# Default partitions
num.partitions=3
default.replication.factor=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

# Log retention
log.retention.hours=168
log.segment.bytes=1073741824
```

## Step 4: Format Storage

```cmd
cd C:\kafka

# Replace YOUR_CLUSTER_ID with the UUID from Step 2
bin\windows\kafka-storage.bat format ^
  -t YOUR_CLUSTER_ID ^
  -c config\kraft\server.properties
```

**Example:**
```cmd
bin\windows\kafka-storage.bat format ^
  -t MkU3OEVBNTcwNTJENDM2Qk ^
  -c config\kraft\server.properties
```

**Expected Output:**
```
Formatting /kafka/kraft-combined-logs with metadata.version 3.6-IV2.
```

## Step 5: Start Kafka (KRaft Mode)

```cmd
cd C:\kafka

# Start Kafka in KRaft mode (no Zookeeper needed!)
bin\windows\kafka-server-start.bat config\kraft\server.properties
```

**Expected Output:**
```
[2024-12-24 10:00:00,000] INFO [KafkaServer id=1] started (kafka.server.KafkaServer)
[2024-12-24 10:00:00,100] INFO Kafka version: 3.6.1
[2024-12-24 10:00:00,200] INFO Kafka commitId: ...
```

**That's it! No Zookeeper needed!** 🎉

## Step 6: Create Topics

```cmd
cd C:\kafka

# Create idea-submitted-topic
bin\windows\kafka-topics.bat --create ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic ^
  --partitions 3 ^
  --replication-factor 1

# Create ai-comparison-result-topic
bin\windows\kafka-topics.bat --create ^
  --bootstrap-server localhost:9092 ^
  --topic ai-comparison-result-topic ^
  --partitions 3 ^
  --replication-factor 1
```

## Step 7: Verify Installation

```cmd
# List topics
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

# Describe topic
bin\windows\kafka-topics.bat --describe ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic
```

## Batch Scripts for KRaft Mode

### `kafka-scripts/start-kafka-kraft.bat`

```batch
@echo off
echo ========================================
echo Starting Kafka (KRaft Mode - No Zookeeper!)
echo ========================================
echo.

REM Check if Kafka is installed
if not exist "C:\kafka\bin\windows\kafka-server-start.bat" (
    echo ERROR: Kafka not found at C:\kafka
    echo Please install Kafka first!
    pause
    exit /b 1
)

REM Check if storage is formatted
if not exist "C:\kafka\kraft-combined-logs\meta.properties" (
    echo ERROR: Kafka storage not formatted!
    echo.
    echo Please run format-kafka-storage.bat first
    pause
    exit /b 1
)

echo Starting Kafka Server (KRaft mode)...
echo Port: 9092
echo Keep this window open!
echo.

cd C:\kafka
bin\windows\kafka-server-start.bat config\kraft\server.properties
```

### `kafka-scripts/format-kafka-storage.bat`

```batch
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

echo Formatting storage...
bin\windows\kafka-storage.bat format ^
  -t %CLUSTER_ID% ^
  -c config\kraft\server.properties

if errorlevel 1 (
    echo.
    echo ERROR: Failed to format storage!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Storage Formatted Successfully!
echo ========================================
echo.
echo Cluster ID: %CLUSTER_ID%
echo.
echo Next step: Run start-kafka-kraft.bat
pause
```

### `kafka-scripts/stop-kafka-kraft.bat`

```batch
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
pause
```

## Complete Startup Script

### `start-all-with-kafka-kraft.bat`

```batch
@echo off
echo ========================================
echo Starting Complete System with Kafka (KRaft Mode)
echo ========================================
echo.

REM Check if Kafka is installed
if not exist "C:\kafka\bin\windows\kafka-server-start.bat" (
    echo ERROR: Kafka not found at C:\kafka
    echo Please install Kafka first!
    pause
    exit /b 1
)

REM Check if storage is formatted
if not exist "C:\kafka\kraft-combined-logs\meta.properties" (
    echo Kafka storage not formatted. Formatting now...
    call kafka-scripts\format-kafka-storage.bat
)

echo Step 1: Starting Kafka (KRaft Mode)...
start "Kafka Server (KRaft)" cmd /k "cd C:\kafka && bin\windows\kafka-server-start.bat config\kraft\server.properties"

echo Waiting 15 seconds for Kafka to start...
timeout /t 15

echo.
echo Step 2: Creating Kafka Topics...
cd kafka-scripts
call create-topics.bat

echo.
echo Step 3: Starting Microservices...
cd ..
call start-all-services.bat

echo.
echo Step 4: Starting ChatModel with Kafka Consumer...
start "ChatModel Kafka Consumer" cmd /k "cd ChatModel && venv\Scripts\activate && python kafka_consumer.py"

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Running Services:
echo - Kafka (KRaft): localhost:9092
echo - Eureka: http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - All Microservices: Running
echo - ChatModel: http://localhost:5000
echo - ChatModel Kafka Consumer: Running
echo.
echo NO ZOOKEEPER NEEDED! ✅
echo.
echo Check status: kafka-scripts\check-kafka-status.bat
echo View messages: kafka-scripts\view-messages.bat
echo.
pause
```

## Testing

### Test Kafka Connection

```cmd
cd C:\kafka

# Check broker info
bin\windows\kafka-broker-api-versions.bat --bootstrap-server localhost:9092
```

### Send Test Message

```cmd
# Producer
bin\windows\kafka-console-producer.bat ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic

# Type messages and press Enter
> Test message 1
> Test message 2
```

### Receive Test Message

```cmd
# Consumer
bin\windows\kafka-console-consumer.bat ^
  --bootstrap-server localhost:9092 ^
  --topic idea-submitted-topic ^
  --from-beginning
```

## Advantages of KRaft Mode

✅ **Simpler**: Only one service (Kafka) instead of two (Kafka + Zookeeper)
✅ **Faster**: Better startup time and performance
✅ **Modern**: Official Kafka direction (Zookeeper deprecated in Kafka 4.0)
✅ **Easier**: Less configuration, fewer ports
✅ **Reliable**: Built-in consensus without external dependency

## Comparison

| Feature | With Zookeeper | KRaft Mode |
|---------|---------------|------------|
| Services | 2 (Kafka + Zookeeper) | 1 (Kafka only) |
| Ports | 2181 + 9092 | 9092 + 9093 |
| Startup Time | Slower | Faster |
| Configuration | Complex | Simple |
| Future Support | Deprecated | Recommended |

## Troubleshooting

### Port 9092 in use

```cmd
netstat -ano | findstr :9092
taskkill /PID <PID> /F
```

### Port 9093 in use

```cmd
netstat -ano | findstr :9093
taskkill /PID <PID> /F
```

### Storage already formatted

```cmd
# Delete and reformat
rmdir /s /q C:\kafka\kraft-combined-logs
call kafka-scripts\format-kafka-storage.bat
```

### Kafka won't start

1. Check if storage is formatted
2. Verify `server.properties` paths use forward slashes: `C:/kafka/...`
3. Check logs in `C:\kafka\kraft-combined-logs`

## Quick Reference

```cmd
# Format storage (first time only)
kafka-scripts\format-kafka-storage.bat

# Start Kafka
kafka-scripts\start-kafka-kraft.bat

# Create topics
kafka-scripts\create-topics.bat

# Check status
kafka-scripts\check-kafka-status.bat

# Stop Kafka
kafka-scripts\stop-kafka-kraft.bat

# Start everything
start-all-with-kafka-kraft.bat
```

## Summary

✅ **No Zookeeper needed!**
✅ **Only one service to manage**
✅ **Simpler and faster**
✅ **Modern Kafka architecture**

---

**KRaft mode is the future of Kafka - simpler, faster, better!** 🚀
