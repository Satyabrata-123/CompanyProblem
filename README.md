# Innovation Platform - Event-Driven Microservices

A complete microservices-based innovation platform with AI-powered idea comparison using Kafka event streaming and Google Gemini AI.

## Quick Start

```bash
# Start everything at once
start-complete-system.bat
```

This starts:
- Kafka (KRaft mode - no Zookeeper)
- All microservices (Eureka, Company, User, Idea, Gamification, AI)
- ChatModel service (Python + Gemini AI)
- Kafka consumer (automatic AI comparison)

## Prerequisites

- Java 17
- Maven 3.6+
- Python 3.x
- Kafka 3.6.1 (installed at `C:\kafka`)
- Gemini API key

## Architecture

The platform uses event-driven architecture with Kafka for asynchronous AI comparison:

```
User submits idea → Company Service → Kafka → Consumer → ChatModel (Gemini AI) → Idea Service
```

**Processing time:** 5-8 seconds (all in background, user sees instant confirmation)

See [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) for detailed architecture.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Eureka | 8761 | Service discovery |
| Company Service | 8081 | Challenges & solutions |
| User Service | 8082 | User management |
| Idea Service | 8083 | Ideas & voting |
| Gamification | 8084 | Points & badges |
| AI Service | 8085 | AI categorization |
| ChatModel | 5000 | Gemini AI comparison |
| Kafka | 9092 | Message broker |
| Frontend | 3000 | React app |

## 🔧 Setup

### 1. Build Services
```bash
build-all-services.bat
```

### 2. Install Python Dependencies
```bash
cd ChatModel
install_dependencies.bat
```

### 3. Configure Environment
Create `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

### 4. Start System
```bash
start-complete-system.bat
```

## Testing

1. Open http://localhost:3000
2. Navigate to a challenge
3. Submit an idea with detailed description
4. Watch Kafka Consumer window for processing logs
5. Check idea details for AI comparison results

See [TEST_KAFKA_FLOW.md](TEST_KAFKA_FLOW.md) for detailed testing guide.

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - System architecture
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Implementation details
- **[KAFKA_CONSUMER_SETUP.md](KAFKA_CONSUMER_SETUP.md)** - Kafka setup guide
- **[KAFKA_KRAFT_SETUP.md](KAFKA_KRAFT_SETUP.md)** - Kafka installation
- **[TEST_KAFKA_FLOW.md](TEST_KAFKA_FLOW.md)** - Testing guide
- **[BUILD_GUIDE.md](BUILD_GUIDE.md)** - Build instructions

## Key Features

### Event-Driven Architecture
- Asynchronous processing with Kafka
- Non-blocking idea submission
- Scalable consumer groups

### AI-Powered Comparison
- Google Gemini AI integration
- Intelligent idea vs solution comparison
- Detailed feedback generation
- Match scoring (0-100)

### Microservices
- Independent service deployment
- Service discovery with Eureka
- RESTful APIs
- H2 in-memory databases

### Performance Monitoring
- Detailed performance metrics
- Resource usage tracking
- Request/response timing

## 🛠️ Development

### Start Individual Services

```bash
# Kafka only
cd kafka-scripts
start-kafka-kraft.bat

# All microservices
start-all-services.bat

# ChatModel only
cd ChatModel
start_service.bat

# Kafka consumer only
start-kafka-consumer.bat
```

### Check Service Health

```bash
# Eureka dashboard
http://localhost:8761

# ChatModel health
curl http://localhost:5000/health

# Kafka status
cd kafka-scripts
check-kafka-status.bat
```

### View Kafka Messages

```bash
cd kafka-scripts
view-messages.bat
```

## Troubleshooting

### Services Won't Start
```bash
# Check ports
netstat -ano | findstr :8761

# Kill process
taskkill /PID <process_id> /F
```

### Kafka Issues
```bash
cd kafka-scripts
format-kafka-storage.bat
start-kafka-kraft.bat
create-topics.bat
```

### Consumer Not Processing
1. Check Kafka: `kafka-scripts\check-kafka-status.bat`
2. Check ChatModel: `curl http://localhost:5000/health`
3. Restart consumer: `start-kafka-consumer.bat`

### AI Comparison Failing
1. Verify `.env` has `GEMINI_API_KEY`
2. Check ChatModel logs
3. Test API: `curl http://localhost:5000/health`

## Technology Stack

**Backend:** Java 17, Spring Boot 3.2.0, Spring Cloud, Spring Kafka, Maven

**AI Service:** Gemini AI

**Message Broker:** Apache Kafka 3.6.1 (KRaft mode)

**Database:** MySQL, JPA/Hibernate

**Frontend:** React 18, React Router, Axios

## Performance

- Idea submission: < 1 second
- Kafka event publishing: < 500ms
- AI comparison: 2-4 seconds
- Total end-to-end: 5-8 seconds

## Deployment

### Production Considerations
- Replace H2 with PostgreSQL/MySQL
- Set up Kafka cluster (3+ brokers)
- Configure proper security (SSL/SASL)
- Add API gateway for routing
- Implement circuit breakers
- Set up monitoring (Prometheus/Grafana)
- Configure log aggregation (ELK stack)

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## Support

For issues and questions:
1. Check documentation files
2. Review service logs
3. Verify prerequisites
4. Check troubleshooting section

## Success Checklist

After starting, verify:
- [ ] Kafka status shows "running"
- [ ] Eureka shows 6 services registered
- [ ] ChatModel health returns 200 OK
- [ ] Consumer logs show "Waiting for messages"
- [ ] Frontend loads at http://localhost:3000
- [ ] Can submit an idea successfully
- [ ] Consumer processes the idea
- [ ] Results appear in idea details

---

**Quick Commands:**
```bash
start-complete-system.bat    # Start everything
build-all-services.bat       # Build all services
kafka-scripts\check-kafka-status.bat  # Check Kafka
kafka-scripts\view-messages.bat       # View messages
```

For detailed information, see the documentation files listed above.
