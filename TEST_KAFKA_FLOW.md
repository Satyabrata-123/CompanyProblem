# Testing Kafka Integration - Complete Flow

## Quick Test Guide

### Prerequisites
✅ All services built successfully
✅ Kafka installed at C:\kafka
✅ Gemini API key in .env file
✅ Python virtual environment set up in ChatModel

### Test Steps

#### 1. Start the Complete System
```bash
start-complete-system.bat
```

This will open 5 terminal windows:
- Kafka Server
- All Microservices
- ChatModel Service
- Kafka Consumer

Wait 1-2 minutes for all services to start.

#### 2. Verify Services are Running

Check each service:
```bash
# Eureka Dashboard
http://localhost:8761

# ChatModel Health
curl http://localhost:5000/health

# Idea Service Health
curl http://localhost:8083/actuator/health

# Company Service Health
curl http://localhost:8081/actuator/health
```

#### 3. Check Kafka Status
```bash
cd kafka-scripts
check-kafka-status.bat
```

Should show: "✅ Kafka is running"

#### 4. Submit a Test Idea

**Option A: Using Frontend**
1. Open http://localhost:3000
2. Navigate to a challenge
3. Submit an idea with detailed description
4. Watch the Kafka Consumer window for processing logs

**Option B: Using API**
```bash
curl -X POST http://localhost:8081/api/challenges/submit-idea ^
  -H "Content-Type: application/json" ^
  -d "{\"challengeId\":\"your-challenge-id\",\"userId\":\"your-user-id\",\"title\":\"Test AI Idea\",\"description\":\"A comprehensive solution using machine learning and cloud architecture to solve the problem efficiently.\"}"
```

#### 5. Watch the Flow

**In Kafka Consumer Window:**
```
📨 Processing IdeaSubmittedEvent: ideaId=xxx, challengeId=yyy
🤖 Triggering AI comparison for ideaId=xxx...
✅ AI Comparison completed:
   Match Score: 85.5
   Match Level: GOOD
   Is Correct: true
✅ Comparison result sent to idea-service
```

**In ChatModel Window:**
```
🔄 Starting dual analysis...
🧠 Using Gemini AI for comparison...
✅ Gemini comparison completed - Score: 85.5
```

#### 6. Verify Results

Check the idea details:
```bash
curl http://localhost:8083/api/ideas/{idea-id}
```

Should include:
```json
{
  "id": "...",
  "title": "...",
  "matchScore": 85.5,
  "matchLevel": "GOOD",
  "isCorrectSolution": true,
  "aiFeedback": "...",
  "aiStrengths": "...",
  "aiImprovements": "..."
}
```

### Expected Timeline

| Step | Time | What Happens |
|------|------|--------------|
| Idea submitted | 0s | User submits through frontend/API |
| Kafka event published | <1s | Company service publishes to Kafka |
| Consumer receives event | <1s | Kafka consumer picks up message |
| Fetch details | 1-2s | Consumer fetches idea and challenge |
| AI comparison | 2-4s | Gemini AI analyzes and compares |
| Save results | <1s | Results saved to database |
| **Total** | **5-8s** | Complete end-to-end processing |

### Troubleshooting

#### Consumer Not Processing
1. Check consumer window for errors
2. Verify Kafka is running: `kafka-scripts\check-kafka-status.bat`
3. Check topic exists: `kafka-scripts\create-topics.bat`
4. Restart consumer: Close window and run `start-kafka-consumer.bat`

#### AI Comparison Failing
1. Check ChatModel window for errors
2. Verify Gemini API key: Check `.env` file
3. Test ChatModel directly:
   ```bash
   curl http://localhost:5000/health
   ```
4. Check ChatModel logs for API errors

#### Results Not Saving
1. Check idea-service logs in "All Services" window
2. Verify database connection
3. Check if idea-service restarted successfully after rebuild
4. Test endpoint directly:
   ```bash
   curl -X PUT http://localhost:8083/api/ideas/{id}/comparison-result ^
     -H "Content-Type: application/json" ^
     -d "{\"matchScore\":75.0,\"matchLevel\":\"GOOD\",\"isCorrectSolution\":true}"
   ```

#### Kafka Connection Issues
1. Stop all services
2. Format Kafka storage:
   ```bash
   cd kafka-scripts
   format-kafka-storage.bat
   ```
3. Restart Kafka:
   ```bash
   start-kafka-kraft.bat
   ```
4. Recreate topics:
   ```bash
   create-topics.bat
   ```
5. Restart services

### Manual Testing

#### Test Kafka Producer (Company Service)
```bash
# Submit idea through company service
curl -X POST http://localhost:8081/api/challenges/submit-idea ^
  -H "Content-Type: application/json" ^
  -d "{\"challengeId\":\"test-id\",\"userId\":\"user-id\",\"title\":\"Test\",\"description\":\"Test description\"}"
```

Check company-service logs for:
```
📤 Publishing IdeaSubmittedEvent: ideaId=xxx, challengeId=yyy
✅ Event published successfully
```

#### Test Kafka Consumer
Watch consumer window for:
```
📬 Received message: partition=0, offset=X
📨 Processing IdeaSubmittedEvent: ideaId=xxx
```

#### Test ChatModel API
```bash
curl -X POST http://localhost:5000/chat/compare-with-solution ^
  -H "Content-Type: application/json" ^
  -d "{\"ideaId\":\"test\",\"challengeId\":\"test\",\"ideaTitle\":\"AI Platform\",\"ideaDescription\":\"Machine learning platform\",\"companySolution\":\"ML-based solution\"}"
```

#### View Kafka Messages
```bash
cd kafka-scripts
view-messages.bat
```

### Performance Monitoring

The ChatModel service logs detailed performance metrics:

```
================================================================================
⚡ PERFORMANCE REPORT
================================================================================
Operation:     AI Comparison (Gemini)
Status:        ✅ SUCCESS
Duration:      3.245s
Timestamp:     2024-12-24 15:30:45

Details:
  • Idea Title: AI-Powered Learning Platform
  • Match Score: 85.5
  • Match Level: GOOD
  • Source: gemini_ai
  • Idea Length: 250
  • Solution Length: 180

System Resources:
  • Memory Usage: 125.45 MB
  • CPU Usage: 15.2%

Overall Stats:
  • Total Requests: 5
  • Success Rate: 100.0%
  • Average Time: 3.124s
  • Total Errors: 0
================================================================================
```

### Success Criteria

✅ Kafka starts without errors
✅ All services register with Eureka
✅ ChatModel service responds to health checks
✅ Kafka consumer connects successfully
✅ Idea submission triggers Kafka event
✅ Consumer processes event within 10 seconds
✅ AI comparison completes successfully
✅ Results saved to database
✅ Frontend displays comparison results

### Next Steps After Testing

1. Monitor performance under load
2. Add error recovery mechanisms
3. Implement retry logic for failed comparisons
4. Add monitoring dashboard
5. Set up alerting for failures
6. Optimize AI comparison prompts
7. Add caching for repeated comparisons

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `netstat -ano \| findstr :PORT` then `taskkill /PID xxx /F` |
| Kafka won't start | Format storage: `kafka-scripts\format-kafka-storage.bat` |
| Consumer not receiving | Check topic exists and consumer group ID |
| Gemini API errors | Verify API key and check quota limits |
| Database errors | Check H2 console or restart idea-service |
| Services not registering | Wait 30s or restart Eureka |

### Support

If issues persist:
1. Check all service logs in terminal windows
2. Review KAFKA_CONSUMER_SETUP.md
3. Verify all prerequisites are met
4. Try stopping and restarting complete system
5. Check Windows Firewall settings for port access
