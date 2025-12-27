# Quick Start Guide - Innovation Platform with Kafka

## 🚀 One-Command Startup

```bash
start-complete-system.bat
```

This starts everything you need:
- ✅ Kafka (KRaft mode - no Zookeeper)
- ✅ All microservices (Eureka, Company, User, Idea, Gamification, AI)
- ✅ ChatModel service (Python + Gemini AI)
- ✅ Kafka consumer (automatic AI comparison)

## 📋 Prerequisites Checklist

Before running, ensure:
- [ ] Java 17 installed
- [ ] Maven installed
- [ ] Python 3.x installed
- [ ] Kafka installed at `C:\kafka`
- [ ] Gemini API key in `.env` file
- [ ] All services built: `build-all-services.bat`
- [ ] Python dependencies installed: `ChatModel\install_dependencies.bat`

## 🎯 What Happens When You Submit an Idea

```
1. User submits idea → Frontend (React)
2. Saved to database → Company Service
3. Event published → Kafka (idea-submitted-topic)
4. Event consumed → Kafka Consumer (Python)
5. AI comparison → ChatModel + Gemini AI
6. Results saved → Idea Service database
```

**Total time: 5-8 seconds** (all in background, user sees instant confirmation)

## 🔍 Verify Everything is Working

### Check Services
```bash
# Eureka Dashboard - Should show all services
http://localhost:8761

# ChatModel Health
curl http://localhost:5000/health

# Kafka Status
cd kafka-scripts
check-kafka-status.bat
```

### Watch the Logs
After starting, you'll have 4 terminal windows:
1. **Kafka Server** - Kafka broker logs
2. **All Services** - Spring Boot microservices
3. **ChatModel Service** - Python Flask + AI logs
4. **Kafka Consumer** - Event processing logs

### Test Idea Submission
1. Open http://localhost:3000
2. Navigate to any challenge
3. Submit an idea with a detailed description
4. Watch the **Kafka Consumer** window for:
   ```
   📨 Processing IdeaSubmittedEvent: ideaId=xxx
   🤖 Triggering AI comparison...
   ✅ AI Comparison completed: Score: 85.5
   ```

## 🛠️ Common Commands

### Start/Stop Kafka
```bash
# Start
cd kafka-scripts
start-kafka-kraft.bat

# Stop
stop-kafka-kraft.bat

# Check status
check-kafka-status.bat
```

### View Kafka Messages
```bash
cd kafka-scripts
view-messages.bat
```

### Restart a Service
```bash
# Stop all services (Ctrl+C in "All Services" window)
# Then restart
start-all-services.bat
```

### Restart Kafka Consumer
```bash
# Close "Kafka Consumer" window
# Then run
start-kafka-consumer.bat
```

## 🐛 Quick Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
netstat -ano | findstr :8761
netstat -ano | findstr :9092

# Kill process if needed
taskkill /PID <process_id> /F
```

### Kafka Won't Start
```bash
cd kafka-scripts
format-kafka-storage.bat
start-kafka-kraft.bat
create-topics.bat
```

### Consumer Not Processing
1. Check Kafka is running: `kafka-scripts\check-kafka-status.bat`
2. Check ChatModel is running: `curl http://localhost:5000/health`
3. Restart consumer: Close window and run `start-kafka-consumer.bat`

### AI Comparison Failing
1. Check `.env` file has `GEMINI_API_KEY=your_key`
2. Check ChatModel logs for errors
3. Test API: `curl http://localhost:5000/health`

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Eureka | 8761 | http://localhost:8761 |
| Company Service | 8081 | http://localhost:8081 |
| User Service | 8082 | http://localhost:8082 |
| Idea Service | 8083 | http://localhost:8083 |
| Gamification | 8084 | http://localhost:8084 |
| AI Service | 8085 | http://localhost:8085 |
| ChatModel | 5000 | http://localhost:5000 |
| Kafka | 9092 | localhost:9092 |
| Frontend | 3000 | http://localhost:3000 |

## 📚 Documentation

- **Complete Setup**: `KAFKA_CONSUMER_SETUP.md`
- **Testing Guide**: `TEST_KAFKA_FLOW.md`
- **Implementation Details**: `IMPLEMENTATION_COMPLETE.md`
- **Kafka Setup**: `KAFKA_KRAFT_SETUP.md`

## 🎓 Understanding the Flow

### When an Idea is Submitted:

**Synchronous (Instant)**:
- ✅ Idea saved to database
- ✅ User gets confirmation
- ✅ Idea appears in list

**Asynchronous (Background)**:
- 📤 Event published to Kafka
- 📨 Consumer receives event
- 🤖 AI comparison triggered
- 💾 Results saved to database
- ✨ Results appear in idea details

### AI Comparison Provides:
- **Match Score**: 0-100 (how well idea matches solution)
- **Match Level**: EXCELLENT/GOOD/PARTIAL/POOR
- **Is Correct**: true/false (qualifies for reward)
- **Feedback**: Detailed analysis
- **Strengths**: What the idea does well
- **Improvements**: What could be better

## 🔥 Pro Tips

1. **Always start Kafka first** - Other services depend on it
2. **Wait 30 seconds** between starting services - Let them register with Eureka
3. **Check Eureka dashboard** - Verify all services are UP
4. **Watch consumer logs** - See real-time processing
5. **Use view-messages.bat** - Debug Kafka issues

## 🆘 Need Help?

1. Check service logs in terminal windows
2. Review documentation files
3. Verify prerequisites are met
4. Try stopping and restarting everything
5. Check Windows Firewall settings

## ✅ Success Checklist

After starting, verify:
- [ ] Kafka status shows "running"
- [ ] Eureka shows 6 services registered
- [ ] ChatModel health returns 200 OK
- [ ] Consumer logs show "Waiting for messages"
- [ ] Frontend loads at http://localhost:3000
- [ ] Can submit an idea successfully
- [ ] Consumer processes the idea
- [ ] Results appear in idea details

## 🎉 You're Ready!

If all checks pass, your system is fully operational. Submit ideas and watch the magic happen!

---

**Quick Commands Reference:**
```bash
# Start everything
start-complete-system.bat

# Build all services
build-all-services.bat

# Check Kafka
cd kafka-scripts && check-kafka-status.bat

# View messages
cd kafka-scripts && view-messages.bat

# Test ChatModel
curl http://localhost:5000/health
```
