# System Architecture - Innovation Platform

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INNOVATION PLATFORM                              │
│                    Event-Driven Microservices Architecture              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                               │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │   React Frontend (3000)     │
                    │  - Dashboard                │
                    │  - Challenges               │
                    │  - Idea Submission          │
                    │  - User Profile             │
                    └──────────┬──────────────────┘
                               │ HTTP/REST
                               ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                         SERVICE DISCOVERY LAYER                           │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │  Eureka Server (8761)       │
                    │  - Service Registry         │
                    │  - Health Monitoring        │
                    │  - Load Balancing           │
                    └──────────┬──────────────────┘
                               │ Registration
                               ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES LAYER                              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Company    │  │     User     │  │     Idea     │  │Gamification  │
│   Service    │  │   Service    │  │   Service    │  │   Service    │
│   (8081)     │  │   (8082)     │  │   (8083)     │  │   (8084)     │
│              │  │              │  │              │  │              │
│ - Challenges │  │ - Users      │  │ - Ideas      │  │ - Points     │
│ - Solutions  │  │ - Auth       │  │ - Votes      │  │ - Badges     │
│ - Difficulty │  │ - Profiles   │  │ - Comments   │  │ - Rewards    │
└──────┬───────┘  └──────────────┘  └──────┬───────┘  └──────────────┘
       │                                    │
       │ Publish Event                      │ Store Results
       ▼                                    ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                          MESSAGE BROKER LAYER                             │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │   Apache Kafka (9092)       │
                    │   KRaft Mode (No Zookeeper) │
                    │                             │
                    │  Topics:                    │
                    │  - idea-submitted-topic     │
                    │  - ai-comparison-result     │
                    └──────────┬──────────────────┘
                               │ Consume Event
                               ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                         EVENT PROCESSING LAYER                            │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │   Kafka Consumer (Python)   │
                    │   Group: chatmodel-consumer │
                    │                             │
                    │  1. Receive Event           │
                    │  2. Fetch Details           │
                    │  3. Trigger AI              │
                    │  4. Send Results            │
                    └──────────┬──────────────────┘
                               │ API Call
                               ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                           AI SERVICES LAYER                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   ChatModel (5000)   │              │   AI Service (8085)  │
│   Python + Flask     │              │   Spring Boot        │
│                      │              │                      │
│ - Gemini AI          │              │ - Categorization     │
│ - Comparison         │              │ - Scoring            │
│ - Feedback           │              │ - Duplicate Check    │
│ - Performance Track  │              │                      │
└──────────┬───────────┘              └──────────────────────┘
           │ Gemini API
           ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL AI LAYER                                │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │   Google Gemini AI          │
                    │   Model: gemini-2.0-flash   │
                    │                             │
                    │ - Intelligent Comparison    │
                    │ - Context Understanding     │
                    │ - Detailed Analysis         │
                    └─────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Company    │  │     User     │  │     Idea     │  │Gamification  │
│   Database   │  │   Database   │  │   Database   │  │   Database   │
│   (H2)       │  │   (H2)       │  │   (H2)       │  │   (H2)       │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Detailed Flow: Idea Submission with AI Comparison

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Submit Idea
     ▼
┌─────────────────┐
│    Frontend     │
│   (React)       │
└────┬────────────┘
     │ 2. POST /api/challenges/submit-idea
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Company Service (8081)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ DifficultyBasedChallengeService                          │  │
│  │                                                          │  │
│  │  1. Validate input                                      │  │
│  │  2. Save idea to database                               │  │
│  │  3. Return success to user ✅ (INSTANT)                 │  │
│  │  4. Publish IdeaSubmittedEvent to Kafka (ASYNC)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           │ IdeaEventProducer                   │
│                           ▼                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Event: {
                            │   ideaId, challengeId,
                            │   userId, title, description
                            │ }
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Apache Kafka (9092)                           │
│                                                                  │
│  Topic: idea-submitted-topic                                    │
│  Partition: 0                                                   │
│  Replication: 1                                                 │
│                                                                  │
│  [Event stored in log]                                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Consumer polls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Kafka Consumer (Python)                             │
│              Group: chatmodel-consumer-group                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ kafka_consumer.py                                        │  │
│  │                                                          │  │
│  │  1. Receive IdeaSubmittedEvent                          │  │
│  │  2. Log: "📨 Processing ideaId=xxx"                     │  │
│  │  3. Fetch idea details from Idea Service               │  │
│  │  4. Fetch challenge details from Company Service       │  │
│  │  5. Prepare comparison request                          │  │
│  │  6. Call ChatModel API                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /chat/compare-with-solution
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ChatModel Service (5000)                        │
│                  Python + Flask + Gemini AI                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ InnovationChatModel.compare_idea_with_solution()        │  │
│  │                                                          │  │
│  │  1. Receive comparison request                          │  │
│  │  2. Build Gemini AI prompt                              │  │
│  │  3. Call Gemini API                                     │  │
│  │  4. Parse AI response                                   │  │
│  │  5. Calculate match score (0-100)                       │  │
│  │  6. Determine match level (EXCELLENT/GOOD/etc)         │  │
│  │  7. Generate feedback                                   │  │
│  │  8. Log performance metrics                             │  │
│  │  9. Return comparison result                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Gemini API Call
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Gemini AI                              │
│                    Model: gemini-2.0-flash-exp                   │
│                                                                  │
│  Analyzes:                                                      │
│  - Technical approach similarity                                │
│  - Key concepts and technologies                                │
│  - Implementation completeness                                  │
│  - Problem understanding                                        │
│                                                                  │
│  Returns JSON with scores and feedback                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ AI Response
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Kafka Consumer (continued)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  7. Receive comparison result from ChatModel            │  │
│  │  8. Log: "✅ AI Comparison completed: Score=85.5"       │  │
│  │  9. Send result to Idea Service                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ PUT /api/ideas/{id}/comparison-result
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Idea Service (8083)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ IdeaController.updateComparisonResult()                 │  │
│  │                                                          │  │
│  │  1. Receive comparison result                           │  │
│  │  2. Find idea by ID                                     │  │
│  │  3. Update fields:                                      │  │
│  │     - matchScore                                        │  │
│  │     - matchLevel                                        │  │
│  │     - isCorrectSolution                                 │  │
│  │     - aiFeedback                                        │  │
│  │     - aiStrengths                                       │  │
│  │     - aiImprovements                                    │  │
│  │  4. Save to database                                    │  │
│  │  5. Return updated idea                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Save to DB
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Idea Database (H2)                            │
│                                                                  │
│  Idea Record Updated:                                           │
│  - id: xxx                                                      │
│  - title: "..."                                                 │
│  - description: "..."                                           │
│  - matchScore: 85.5                                             │
│  - matchLevel: "GOOD"                                           │
│  - isCorrectSolution: true                                      │
│  - aiFeedback: "Excellent approach..."                          │
│  - aiStrengths: "Strong technical design..."                    │
│  - aiImprovements: "Consider adding..."                         │
│  - updatedAt: 2024-12-24 15:30:45                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User refreshes page
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│                                                                  │
│  Displays:                                                      │
│  ✅ Idea submitted successfully                                 │
│  📊 Match Score: 85.5/100                                       │
│  🎯 Match Level: GOOD                                           │
│  ✅ Qualifies for reward!                                       │
│  💬 Feedback: "Excellent approach..."                           │
│  💪 Strengths: "Strong technical design..."                     │
│  📈 Improvements: "Consider adding..."                          │
└─────────────────────────────────────────────────────────────────┘
```

## Timing Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING TIMELINE                            │
└─────────────────────────────────────────────────────────────────┘

0s    │ User clicks "Submit Idea"
      │
0.5s  │ ✅ Idea saved to database
      │ ✅ User sees success message
      │ ✅ Idea appears in list
      │
      │ ─────────── ASYNC PROCESSING BEGINS ───────────
      │
1s    │ 📤 Event published to Kafka
      │
1.5s  │ 📨 Consumer receives event
      │
2s    │ 🔍 Fetching idea details
      │
2.5s  │ 🔍 Fetching challenge details
      │
3s    │ 🤖 Calling ChatModel API
      │
3.5s  │ 🧠 Gemini AI analyzing...
      │
5s    │ ✅ AI analysis complete
      │
5.5s  │ 💾 Saving results to database
      │
6s    │ ✅ COMPLETE - Results available
      │
      │ User refreshes page and sees AI feedback
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STRUCTURES                               │
└─────────────────────────────────────────────────────────────────┘

IdeaSubmittedEvent (Kafka Message):
{
  "eventId": "uuid",
  "ideaId": "uuid",
  "challengeId": "uuid",
  "userId": "uuid",
  "title": "string",
  "description": "string",
  "submittedAt": "timestamp"
}

ComparisonRequest (to ChatModel):
{
  "ideaId": "uuid",
  "challengeId": "uuid",
  "ideaTitle": "string",
  "ideaDescription": "string",
  "companySolution": "string",
  "challengeTitle": "string",
  "challengeDescription": "string"
}

ComparisonResult (from ChatModel):
{
  "ideaId": "uuid",
  "challengeId": "uuid",
  "matchScore": 85.5,
  "matchLevel": "GOOD",
  "isCorrectSolution": true,
  "feedback": "Excellent approach...",
  "strengths": "Strong technical design...",
  "improvements": "Consider adding...",
  "source": "gemini_ai"
}

ComparisonResultRequest (to Idea Service):
{
  "matchScore": 85.5,
  "matchLevel": "GOOD",
  "isCorrectSolution": true,
  "feedback": "Excellent approach...",
  "strengths": "Strong technical design...",
  "improvements": "Consider adding..."
}
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Frontend:
├── React 18
├── React Router
├── Axios
└── CSS3

Backend Services:
├── Java 17
├── Spring Boot 3.2.0
├── Spring Cloud (Eureka)
├── Spring Kafka
├── Spring Data JPA
├── Lombok
└── Maven

AI Services:
├── Python 3.x
├── Flask 2.3.3
├── Langchain
├── Google Gemini AI
├── Kafka-Python 2.0.2
└── psutil (monitoring)

Message Broker:
├── Apache Kafka 3.6.1
├── KRaft mode
└── No Zookeeper

Database:
├── H2 (in-memory)
├── JPA/Hibernate
└── Auto DDL

Monitoring:
├── Spring Actuator
├── Custom performance tracking
└── Detailed logging
```

## Scalability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALING STRATEGY                              │
└─────────────────────────────────────────────────────────────────┘

Horizontal Scaling:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Consumer 1  │  │  Consumer 2  │  │  Consumer 3  │
│  Instance    │  │  Instance    │  │  Instance    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                    Same Consumer Group
                         │
                    Kafka Partitions
                    (Load Balanced)

Service Scaling:
┌──────────────┐  ┌──────────────┐
│  Service A   │  │  Service A   │
│  Instance 1  │  │  Instance 2  │
└──────────────┘  └──────────────┘
       │                 │
       └────────┬────────┘
                │
           Eureka Registry
           (Load Balanced)
```

This architecture provides:
- ✅ High availability
- ✅ Fault tolerance
- ✅ Horizontal scalability
- ✅ Event-driven processing
- ✅ Asynchronous operations
- ✅ Microservices independence
