# Quick Test: ChatModel AI Comparison

## Start Services
```bash
start-with-chat.bat
```

## Test 1: Direct ChatModel Comparison

```bash
curl -X POST http://localhost:5000/chat/compare-with-solution \
  -H "Content-Type: application/json" \
  -d "{\"ideaTitle\":\"WebSocket Chat System\",\"ideaDescription\":\"Real-time chat using WebSocket for bidirectional communication, Redis pub/sub for message distribution, MongoDB for chat history storage, JWT authentication for security\",\"companySolution\":\"WebSocket-based real-time system with Redis pub/sub messaging, MongoDB persistence, and JWT authentication\"}"
```

**Expected**: Score 85-95 (GOOD/EXCELLENT)

## Test 2: Low Quality Submission

```bash
curl -X POST http://localhost:5000/chat/compare-with-solution \
  -H "Content-Type: application/json" \
  -d "{\"ideaTitle\":\"test\",\"ideaDescription\":\"test test test\",\"companySolution\":\"WebSocket-based real-time system with Redis and MongoDB\"}"
```

**Expected**: Score 10-25 (POOR)

## Test 3: Check ChatModel Health

```bash
curl http://localhost:5000/health
```

**Expected**:
```json
{
  "status": "UP",
  "service": "innovation-chat-model",
  "gemini_available": true
}
```

## Test 4: Full Integration Test

### Step 1: Create Challenge
```bash
curl -X POST http://localhost:8080/api/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "challenge": {
      "companyId": "your-company-id",
      "title": "Build Real-Time Chat",
      "description": "Create scalable chat application",
      "requirements": "Support 1000+ users",
      "difficulty": "INTERMEDIATE",
      "category": "Backend",
      "rewardAmount": 500,
      "maxSubmissions": 50
    },
    "internalSolutionBrief": "Use WebSocket for real-time communication, Redis for pub/sub messaging and caching, MongoDB for message persistence, implement horizontal scaling with load balancer, add JWT authentication"
  }'
```

### Step 2: Submit Good Idea
```bash
curl -X POST http://localhost:8080/api/challenges/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "challenge-id-from-step-1",
    "userId": "user-id",
    "userName": "Test User",
    "challengeDifficulty": "INTERMEDIATE",
    "title": "WebSocket Chat with Redis and MongoDB",
    "description": "Comprehensive real-time chat solution",
    "solutionApproach": "Implement WebSocket server with Socket.io for bidirectional communication. Use Redis pub/sub for message distribution across multiple server instances.",
    "technicalDetails": "Architecture: Load balancer → Multiple Node.js servers → Redis cluster → MongoDB replica set. Security: JWT authentication, rate limiting, input validation. Scalability: Horizontal scaling with Redis pub/sub.",
    "implementationPlan": "Phase 1: Setup WebSocket server. Phase 2: Integrate Redis. Phase 3: Add MongoDB persistence. Phase 4: Implement authentication. Phase 5: Load testing."
  }'
```

**Expected**: 
- Status: ACCEPTED
- companyScore: 80-95
- companyFeedback: Positive with specific strengths

### Step 3: Submit Poor Idea
```bash
curl -X POST http://localhost:8080/api/challenges/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "challenge-id-from-step-1",
    "userId": "user-id",
    "userName": "Test User",
    "challengeDifficulty": "INTERMEDIATE",
    "title": "test",
    "description": "a b c test test"
  }'
```

**Expected**:
- Status: SUBMITTED
- companyScore: 10-25
- companyFeedback: Needs substantial improvement

### Step 4: Check Results
```bash
curl http://localhost:8080/api/challenges/{challengeId}/ideas
```

## Verify Gemini AI is Working

```bash
curl http://localhost:5000/chat/system-status
```

**Expected**:
```json
{
  "services": {
    "gemini_ai": {
      "status": "UP",
      "api_key_present": true
    }
  },
  "capabilities": {
    "gemini_only": true
  }
}
```

## Common Issues

### Issue: "Gemini AI unavailable"
**Solution**: 
1. Check `.env` file has `GEMINI_API_KEY`
2. Verify API key is valid
3. System will use fallback algorithm automatically

### Issue: "ChatModel not responding"
**Solution**:
```bash
cd ChatModel
python chatModel.py
```

### Issue: "All scores are the same"
**Solution**:
1. Verify ChatModel is running: `curl http://localhost:5000/health`
2. Check company service can reach ChatModel
3. Ensure challenge has `internalSolutionBrief` set

## Success Indicators

✅ ChatModel returns different scores for different quality submissions
✅ High-quality ideas get 70-95 scores
✅ Low-quality ideas get 10-30 scores
✅ Feedback is specific and contextual
✅ Ideas with score ≥70 get ACCEPTED status automatically

## Quick Comparison Test

**Good Idea** (should score 80+):
- Detailed description (>200 chars)
- Mentions key technologies (WebSocket, Redis, MongoDB)
- Explains implementation approach
- Considers security and scalability

**Poor Idea** (should score <30):
- Very short (<50 chars)
- Generic or repetitive text
- No technical details
- Missing key concepts

---

**Ready to test!** Start with Test 1 to verify ChatModel is working, then try the full integration test.
