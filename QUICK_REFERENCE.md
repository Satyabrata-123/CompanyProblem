# Company Challenge System - Quick Reference

## 🚀 Quick Start Commands

```bash
# Start all services
start-services.bat          # Windows CMD
.\start-services.ps1        # Windows PowerShell

# Create database
mysql -u root -p < database-setup.sql

# Start frontend
cd frontend && npm run dev
```

## 🌐 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Challenges List | `/challenges` | Browse all challenges |
| Challenge Detail | `/challenges/:id` | View challenge details |
| Submit Solution | `/challenges/:id/submit` | Submit your solution |
| Solution Detail | `/solutions/:id` | View solution details |
| Company Dashboard | `/company/dashboard` | Manage company challenges |
| Company Register | `/company/register` | Register new company |

## 📡 API Endpoints

### Companies
```
POST   /api/companies              - Register company
GET    /api/companies              - List all companies
GET    /api/companies/verified     - List verified companies
GET    /api/companies/:id          - Get company details
PUT    /api/companies/:id          - Update company
PUT    /api/companies/:id/verify   - Verify company
```

### Challenges
```
POST   /api/challenges                    - Create challenge
GET    /api/challenges                    - List active challenges
GET    /api/challenges/difficulty/:level  - Filter by difficulty
GET    /api/challenges/company/:id        - Get company challenges
GET    /api/challenges/:id                - Get challenge details
GET    /api/challenges/featured           - Get featured challenges
PUT    /api/challenges/:id/status         - Update status
```

### Solutions
```
POST   /api/solutions                     - Submit solution
GET    /api/solutions/challenge/:id       - Get challenge solutions
GET    /api/solutions/challenge/:id/top   - Get top solutions
GET    /api/solutions/user/:id            - Get user solutions
GET    /api/solutions/:id                 - Get solution details
PUT    /api/solutions/:id/status          - Update status/score
PUT    /api/solutions/:id/vote-count      - Vote on solution
```

## 🎯 Difficulty Levels

| Level | Description | Typical Reward |
|-------|-------------|----------------|
| **BEGINNER** | Simple problems, basic concepts | $500 - $2,000 |
| **INTERMEDIATE** | Moderate complexity, multiple components | $2,000 - $10,000 |
| **EXPERT** | Complex systems, advanced architecture | $10,000+ |

## 📊 Solution Status Flow

```
SUBMITTED → UNDER_REVIEW → ACCEPTED/REJECTED → WINNER
```

- **SUBMITTED**: Initial submission
- **UNDER_REVIEW**: Being evaluated by company
- **ACCEPTED**: Solution meets requirements
- **REJECTED**: Solution doesn't meet requirements
- **WINNER**: Selected as winning solution

## 🔑 Key Features

### For Companies
✅ Register and get verified  
✅ Create challenges with difficulty levels  
✅ Set rewards and deadlines  
✅ Provide internal solution briefs (hidden)  
✅ Review and score submissions  
✅ Select winners  

### For Users
✅ Browse challenges by difficulty  
✅ Submit detailed solutions  
✅ Include GitHub repos and demos  
✅ Track submission status  
✅ Receive scores and feedback  
✅ Vote on other solutions  

### For Platform
✅ Company verification system  
✅ Internal solution comparison  
✅ Automated submission tracking  
✅ Community voting system  
✅ Analytics and reporting  

## 🗄️ Database Tables

### Company_Service Database
- **companies** - Company profiles and verification
- **challenges** - Problem statements with internal solutions

### Idea_Service Database (Extended)
- **ideas** - Original idea submissions
- **solutions** - Challenge solution submissions (NEW)

## 🔐 Security Features

### Internal Solution Briefs
- Stored in `challenges.internal_solution_brief`
- **Never sent to frontend**
- Used only for backend evaluation
- Helps maintain fair scoring

### Company Verification
- Manual verification required
- `companies.is_verified` flag
- Only verified companies can post challenges

## 📝 Sample Data

### Create Test Company
```json
{
  "name": "Tech Corp",
  "email": "tech@example.com",
  "industry": "Technology",
  "size": "MEDIUM"
}
```

### Create Test Challenge
```json
{
  "challenge": {
    "companyId": "uuid-here",
    "title": "Build REST API",
    "description": "Create a scalable REST API",
    "difficulty": "INTERMEDIATE",
    "rewardAmount": 3000
  },
  "internalSolutionBrief": "Use Spring Boot with PostgreSQL"
}
```

### Submit Test Solution
```json
{
  "challengeId": "uuid-here",
  "submittedBy": "user-uuid",
  "title": "Scalable REST API Solution",
  "description": "Built with Spring Boot",
  "technologies": "Spring Boot, PostgreSQL, Docker"
}
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8086
taskkill /PID <pid> /F
```

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `application.yml`
- Ensure database exists

### Service Not Registered in Eureka
- Wait 30 seconds for registration
- Check Eureka dashboard at http://localhost:8761
- Verify `eureka.client.service-url.defaultZone`

## 📞 Service Ports

```
8761 - Eureka Server
8080 - API Gateway
8081 - Idea Service
8082 - User Service
8083 - Voting Service
8084 - Gamification Service
8085 - AI Service
8086 - Company Service (NEW)
3000 - Frontend
```

## 🎨 Frontend Components

### Pages Created
- `ChallengesListPage` - Browse challenges
- `ChallengeDetailPage` - View challenge + solutions
- `SubmitSolutionPage` - Submit solution form
- `SolutionDetailPage` - View solution details
- `CompanyDashboardPage` - Manage challenges
- `CompanyRegisterPage` - Register company

### Key CSS Classes
- `.difficulty-badge` - Difficulty level indicator
- `.status-badge` - Status indicator
- `.challenge-card` - Challenge display card
- `.solution-card` - Solution display card

## 🔄 Typical Workflows

### Company Posts Challenge
1. Register company → `/company/register`
2. Wait for verification
3. Create challenge → Company Dashboard
4. Monitor submissions
5. Review and score solutions
6. Select winner

### User Solves Challenge
1. Browse challenges → `/challenges`
2. Select challenge by difficulty
3. View requirements
4. Submit solution → `/challenges/:id/submit`
5. Track status
6. Receive feedback and score

## 📈 Metrics to Track

- Total challenges posted
- Submissions per challenge
- Average solution score
- User participation rate
- Company satisfaction
- Time to solution
- Reward distribution

## 🎓 Best Practices

### For Companies
- Provide clear requirements
- Set realistic deadlines
- Offer competitive rewards
- Give constructive feedback
- Respond to questions promptly

### For Users
- Read requirements carefully
- Provide detailed documentation
- Include working demos
- Write clean, maintainable code
- Test thoroughly before submission

### For Platform
- Verify companies manually
- Monitor solution quality
- Prevent spam submissions
- Maintain fair evaluation
- Protect internal solution briefs

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed setup instructions or `COMPANY_CHALLENGES_README.md` for system architecture.