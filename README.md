# Employee Innovation Management Platform

A comprehensive Spring Boot microservices backend for managing employee ideas, voting, gamification, and AI-powered categorization.

## Architecture

This project uses a microservices architecture with the following services:

### Services

1. **API Gateway** (Port 8080)
   - Central entry point for all requests
   - Routes traffic to appropriate microservices
   - Handles CORS configuration

2. **Idea Service** (Port 8081)
   - Manages idea submissions and lifecycle
   - Tracks idea status through workflow stages
   - Handles idea categorization and scoring

3. **User Service** (Port 8082)
   - User profile management
   - Leaderboard functionality
   - Tracks user statistics and achievements

4. **Voting Service** (Port 8083)
   - Vote casting and management
   - Comment system for ideas
   - Prevents duplicate voting

5. **Gamification Service** (Port 8084)
   - Points and rewards system
   - Badge management
   - Achievement tracking

6. **AI Service** (Port 8085)
   - Automatic idea categorization
   - Tag extraction
   - Quality scoring
   - Duplicate detection

### Common Library
Shared DTOs, enums, and utilities used across all services.

## Database

The project uses PostgreSQL (Supabase) with the following tables:
- `users` - User profiles and statistics
- `ideas` - Innovation ideas with metadata
- `votes` - User votes on ideas
- `comments` - Discussion on ideas
- `badges` - Achievement definitions
- `user_badges` - Badges earned by users

All tables have Row Level Security (RLS) enabled for data protection.

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Cloud Gateway
- Spring Data JPA
- PostgreSQL (Supabase)
- WebFlux for inter-service communication
- Lombok for boilerplate reduction
- Maven for build management

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL database (Supabase configured)

### Configuration

Update the database password in each service's `application.yml`:
```yaml
spring:
  datasource:
    password: ${SUPABASE_DB_PASSWORD:your-actual-password}
```

Or set the environment variable:
```bash
export SUPABASE_DB_PASSWORD=your-actual-password
```

### Build

Build all services:
```bash
mvn clean install
```

### Run Services

Start each service in order:

```bash
# Terminal 1 - API Gateway
cd api-gateway
mvn spring-boot:run

# Terminal 2 - Idea Service
cd idea-service
mvn spring-boot:run

# Terminal 3 - User Service
cd user-service
mvn spring-boot:run

# Terminal 4 - Voting Service
cd voting-service
mvn spring-boot:run

# Terminal 5 - Gamification Service
cd gamification-service
mvn spring-boot:run

# Terminal 6 - AI Service
cd ai-service
mvn spring-boot:run
```

## API Endpoints

All requests go through the API Gateway at `http://localhost:8080`

### Ideas API
- `POST /api/ideas` - Create new idea
- `GET /api/ideas` - Get all ideas
- `GET /api/ideas/{id}` - Get idea by ID
- `GET /api/ideas/user/{userId}` - Get user's ideas
- `GET /api/ideas/status/{status}` - Get ideas by status
- `GET /api/ideas/top` - Get top voted ideas
- `PUT /api/ideas/{id}/status?status={status}` - Update idea status

### Users API
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/leaderboard` - Get top users by points

### Voting API
- `POST /api/votes` - Cast vote
- `GET /api/votes/idea/{ideaId}` - Get votes for idea
- `GET /api/votes/idea/{ideaId}/user/{userId}` - Get user's vote for idea
- `DELETE /api/votes/idea/{ideaId}/user/{userId}` - Remove vote

### Comments API
- `POST /api/comments` - Add comment
- `GET /api/comments/idea/{ideaId}` - Get comments for idea
- `DELETE /api/comments/{commentId}` - Delete comment

### Gamification API
- `POST /api/gamification/points/idea-submitted/{userId}` - Award points for idea submission
- `POST /api/gamification/points/vote/{userId}` - Award points for voting
- `POST /api/gamification/points/implemented/{userId}` - Award points for implemented idea
- `POST /api/gamification/points/comment/{userId}` - Award points for commenting
- `GET /api/gamification/badges` - Get all badges
- `GET /api/gamification/badges/user/{userId}` - Get user's badges

### AI API
- `POST /api/ai/categorize` - Categorize idea
- `POST /api/ai/duplicates?title={title}&description={description}` - Find duplicates

## Features Implemented

### Core Features
- Central idea submission platform
- Workflow tracking (Submitted → Under Review → Approved → In Development → Implemented)
- Voting system with upvote/downvote
- Comment and discussion system
- User profiles with statistics

### AI & Automation
- Automatic idea categorization
- Tag extraction
- Quality scoring algorithm
- Duplicate detection foundation

### Gamification
- Points system for actions:
  - Idea submission: 10 points
  - Voting: 5 points
  - Implemented idea: 100 points
  - Adding comment: 2 points
- Badge system
- Leaderboard

### Security
- Row Level Security on all tables
- Role-based access control (employee, manager, admin)
- Authenticated user policies

## Future Enhancements

- Integration with external AI services (OpenAI, etc.)
- Advanced duplicate detection with vector embeddings
- Email notifications
- Real-time updates with WebSocket
- Analytics dashboard
- Export functionality
- Mobile app integration
