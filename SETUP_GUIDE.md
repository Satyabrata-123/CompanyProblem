# Company Challenge System - Setup Guide

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js 16+** (for frontend)
- **Git**

## 🗄️ Database Setup

### 1. Create MySQL Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create the new database
CREATE DATABASE IF NOT EXISTS Company_Service;

-- Verify database creation
SHOW DATABASES LIKE '%_Service';
```

You should see these databases:
- `Idea_Service`
- `User_Service`
- `Voting_Service`
- `Gamification_Service`
- `AI_Service`
- `Company_Service` (new)

### 2. Update Database Credentials

If your MySQL credentials are different, update these files:
- `company-service/src/main/resources/application.yml`
- Other service `application.yml` files if needed

```yaml
spring:
  datasource:
    username: root
    password: YOUR_PASSWORD  # Update this
```

## 🚀 Build & Start Services

### Option 1: Using Batch Script (Windows)

```bash
# Build and start all services
start-services.bat
```

### Option 2: Using PowerShell Script (Windows)

```powershell
# Build and start all services
.\start-services.ps1
```

### Option 3: Manual Build

```bash
# Build all services
mvn clean install -DskipTests

# Start each service in separate terminals
cd eureka && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
cd idea-service && mvn spring-boot:run
cd user-service && mvn spring-boot:run
cd voting-service && mvn spring-boot:run
cd gamification-service && mvn spring-boot:run
cd ai-service && mvn spring-boot:run
cd company-service && mvn spring-boot:run
```

## 🌐 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Eureka Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| Idea Service | 8081 | http://localhost:8081 |
| User Service | 8082 | http://localhost:8082 |
| Voting Service | 8083 | http://localhost:8083 |
| Gamification Service | 8084 | http://localhost:8084 |
| AI Service | 8085 | http://localhost:8085 |
| **Company Service** | **8086** | **http://localhost:8086** |
| Frontend | 3000 | http://localhost:3000 |

## 🎯 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the application at: **http://localhost:3000**

## ✅ Verify Installation

### 1. Check Eureka Dashboard
Visit http://localhost:8761 and verify all services are registered:
- API-GATEWAY
- IDEA-SERVICE
- USER-SERVICE
- VOTING-SERVICE
- GAMIFICATION-SERVICE
- AI-SERVICE
- **COMPANY-SERVICE** (new)

### 2. Test API Gateway
```bash
# Test company service through gateway
curl http://localhost:8080/api/companies

# Test challenges endpoint
curl http://localhost:8080/api/challenges

# Test solutions endpoint
curl http://localhost:8080/api/solutions
```

### 3. Check Database Tables

```sql
-- Check Company Service tables
USE Company_Service;
SHOW TABLES;
-- Should show: companies, challenges

-- Check Idea Service tables
USE Idea_Service;
SHOW TABLES;
-- Should show: ideas, solutions (new)
```

## 📱 Using the System

### For Companies

1. **Register Company**
   - Navigate to `/company/register`
   - Fill in company details
   - Wait for verification (manual process)

2. **Create Challenge**
   - Go to Company Dashboard
   - Click "Create New Challenge"
   - Fill in challenge details
   - Add internal solution brief (hidden from users)
   - Set difficulty level and rewards

3. **Review Solutions**
   - View submissions from dashboard
   - Evaluate and score solutions
   - Provide feedback to users

### For Users

1. **Browse Challenges**
   - Navigate to `/challenges`
   - Filter by difficulty level
   - View challenge details

2. **Submit Solution**
   - Click "Submit Your Solution"
   - Provide implementation details
   - Add GitHub repo and demo links
   - Submit for evaluation

3. **Track Progress**
   - View your submissions
   - Check scores and feedback
   - See community votes

## 🔧 Troubleshooting

### Service Won't Start

**Problem**: Port already in use
```bash
# Windows - Find and kill process
netstat -ano | findstr :8086
taskkill /PID <process_id> /F
```

**Problem**: Database connection failed
- Verify MySQL is running
- Check credentials in `application.yml`
- Ensure database exists

### Build Failures

**Problem**: Common module not found
```bash
# Install parent POM first
mvn clean install -N -DskipTests

# Then install common module
mvn clean install -DskipTests -pl common

# Finally build all
mvn clean install -DskipTests
```

### Frontend Issues

**Problem**: API calls failing
- Check API Gateway is running on port 8080
- Verify CORS configuration in gateway
- Check browser console for errors

## 🔐 Security Notes

### Internal Solution Briefs
- **Never exposed** to frontend
- Stored securely in database
- Only accessible by platform for evaluation
- Used to score and rank solutions

### Company Verification
- Manual verification required
- Only verified companies can post challenges
- Prevents spam and ensures quality

## 📊 Database Schema

### Companies Table
```sql
CREATE TABLE companies (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(200),
    industry VARCHAR(100),
    size VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Challenges Table
```sql
CREATE TABLE challenges (
    id BINARY(16) PRIMARY KEY,
    company_id BINARY(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT') NOT NULL,
    category VARCHAR(100),
    reward_amount DECIMAL(10,2),
    reward_currency VARCHAR(10) DEFAULT 'USD',
    submission_deadline TIMESTAMP,
    max_submissions INT,
    current_submissions INT DEFAULT 0,
    tags TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    internal_solution_brief TEXT,  -- Hidden from users
    evaluation_criteria TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### Solutions Table
```sql
CREATE TABLE solutions (
    id BINARY(16) PRIMARY KEY,
    challenge_id BINARY(16) NOT NULL,
    submitted_by BINARY(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    implementation TEXT,
    technologies VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WINNER') NOT NULL,
    score DECIMAL(5,2),
    feedback TEXT,
    vote_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎉 Next Steps

1. **Test the System**
   - Register a test company
   - Create sample challenges
   - Submit test solutions

2. **Customize**
   - Adjust reward amounts
   - Modify difficulty levels
   - Update evaluation criteria

3. **Deploy**
   - Configure production database
   - Set up environment variables
   - Deploy to cloud platform

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Netflix](https://spring.io/projects/spring-cloud-netflix)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [React Documentation](https://react.dev/)

## 🆘 Support

If you encounter issues:
1. Check service logs in terminal windows
2. Verify database connections
3. Review Eureka dashboard for service status
4. Check API Gateway routes configuration

For detailed implementation, see `COMPANY_CHALLENGES_README.md`