# Innovation Platform - Project Flow

## 🎯 What It Does
Platform where users submit solutions to company challenges, with AI-powered evaluation using Google Gemini API.

## 🏗️ Tech Stack

**Frontend**: React 18 + Vite + Tailwind CSS  
**Backend**: Spring Boot + Java 17 (Microservices)  
**AI**: Python Flask + Langchain + Google Gemini API  
**Messaging**: Apache Kafka  
**Database**: MySQL (separate DB per service)

### Services & Ports
- Frontend (3000)
- API Gateway (8080)
- Eureka (8761)
- Company Service (8081)
- User Service (8082)
- Idea Service (8083)
- Gamification (8084)
- AI Service (8085)
- ChatModel (5000)
- Kafka (9092)

---

## 🔄 COMPLETE FLOW

### FLOW 1: Company Creates Challenge

| Step | Component | What Happens |
|------|-----------|--------------|
| 1 | **Frontend** | Company fills form (title, description, difficulty, internal solution) |
| 2 | **API Gateway** | Routes POST `/api/challenges` to Company Service |
| 3 | **Company Service** | Validates company is verified, creates challenge entity |
| 4 | **Database Logic** | Saves to difficulty-specific table (beginner/intermediate/expert_challenges) |
| 5 | **MySQL** | Challenge stored with `internalSolutionBrief` (hidden from users), status = ACTIVE |
| 6 | **Response** | Returns challenge DTO to frontend, challenge now visible to users |

---

### FLOW 2: User Submits Solution (MAIN FLOW)

#### Part A: Synchronous (Instant - <1 second)

| Step | Component | What Happens |
|------|-----------|--------------|
| 1 | **Frontend** | User fills form (title, description, technologies), validates min 50 chars |
| 2 | **API Gateway** | Routes POST `/api/challenges/ideas` to Company Service |
| 3 | **Company Service** | Creates ChallengeIdea entity, status = SUBMITTED |
| 4 | **MySQL** | Saves to `challenge_ideas` table, increments challenge.currentSubmissions |
| 5 | **Response** | Returns success to user ✅ (user sees confirmation immediately) |

#### Part B: Asynchronous (Background - 5-8 seconds)

| Step | Component | What Happens |
|------|-----------|--------------|
| 6 | **Kafka Producer** | Builds IdeaSubmittedEvent with solution + challenge details |
| 7 | **Kafka Broker** | Event published to topic `idea-submitted-topic`, stored in Kafka |
| 8 | **Kafka Consumer** | Python consumer receives event, logs "Processing IdeaSubmittedEvent" |
| 9 | **Consumer Fetch** | Calls Idea Service & Company Service to get full details + internal solution |
| 10 | **ChatModel API** | Consumer calls POST `/chat/compare-with-solution` with both solutions |
| 11 | **Gemini AI** | Analyzes & compares, generates match score, feedback, AI detection |
| 12 | **AI Response** | Returns: matchScore (0-100%), matchLevel, isCorrectSolution, feedback, strengths, improvements |
| 13 | **Consumer Update** | Sends results to Idea Service PUT `/api/ideas/{ideaId}/comparison-result` |
| 14 | **Idea Service** | Updates idea record with all AI analysis fields |
| 15 | **MySQL** | AI results saved to database, now available for user to view |

---

### FLOW 3: User Views Results

| Step | Component | What Happens |
|------|-----------|--------------|
| 1 | **Frontend** | User navigates to submission, calls GET `/api/ideas/{ideaId}` |
| 2 | **API Gateway** | Routes request to Idea Service |
| 3 | **Idea Service** | Fetches idea with AI results from database |
| 4 | **MySQL** | Returns idea record with matchScore, feedback, etc. |
| 5 | **Frontend Display** | Shows match score %, match level badge, AI detection warning, detailed feedback, reward status |

---

## 🤖 WHERE KAFKA IS USED

**Event**: `IdeaSubmittedEvent`  
**Topic**: `idea-submitted-topic`  
**Publisher**: Company Service (IdeaEventProducer.java)  
**Consumer**: Python Kafka Consumer (kafka_consumer.py)

**Why?**
- User doesn't wait for AI processing (5-8 seconds)
- Decouples submission from AI analysis
- Scalable - multiple consumers can process in parallel
- Reliable - events stored, can retry on failure

**Flow**:
```
Submit → Save DB (instant) → Publish Kafka → Return Success
                                   ↓
                           Consumer processes
                                   ↓
                           AI analyzes (5-8s)
                                   ↓
                           Save results to DB
```

---

## 📊 DATA FLOW DIAGRAM

```
Frontend (React)
    ↓
API Gateway
    ↓
Company Service ──→ MySQL (save submission)
    ↓
Kafka (publish event)
    ↓
Consumer (Python) ──→ Fetch details
    ↓
ChatModel (Flask) ──→ Gemini AI
    ↓
Idea Service ──→ MySQL (save results)
```

---

## 🔐 AUTHENTICATION

**Users**: Email only (no password) → User Service → localStorage  
**Companies**: Email only → Company Service → separate localStorage

Dual auth system with separate flows and storage.

---

## 🛠️ KEY COMPONENTS

| Component | Role |
|-----------|------|
| **Company Service** | Manages challenges, stores submissions, publishes Kafka events |
| **Idea Service** | Stores AI results, manages ideas |
| **Kafka** | Event streaming for async AI processing |
| **Kafka Consumer** | Listens for submissions, triggers AI |
| **ChatModel** | Flask API wrapper for Gemini AI |
| **Gemini API** | AI comparison & content detection |

---

## 📝 SUMMARY

**Synchronous**: Save submission → Return success (<1 sec)  
**Asynchronous**: Kafka event → AI analysis → Save results (5-8 sec)

User gets instant confirmation, AI processes in background.
