# API Documentation - Company Registration & Authentication

## Base URL
```
http://localhost:8080/api
```

---

## 🏢 COMPANY ENDPOINTS

### 1. Register Company
**Endpoint:** `POST /companies`

**Description:** Register a new company on the platform

**Request Body:**
```json
{
  "name": "TechCorp Solutions",
  "description": "Leading technology company focused on innovation",
  "email": "contact@techcorp.com",
  "phone": "+1234567890",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "size": "MEDIUM",
  "address": "123 Tech Street, Silicon Valley, CA",
  "contactPerson": "John Doe",
  "isVerified": false,
  "isActive": true
}
```

**Field Descriptions:**
- `name` (required): Company name
- `description` (required): Brief company description
- `email` (required): Company contact email
- `phone` (optional): Contact phone number
- `website` (optional): Company website URL
- `industry` (required): Industry type (Technology, Healthcare, Finance, etc.)
- `size` (required): Company size - `STARTUP`, `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE`
- `address` (optional): Physical address
- `contactPerson` (optional): Primary contact person name
- `isVerified` (optional): Verification status (default: false)
- `isActive` (optional): Active status (default: true)

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "TechCorp Solutions",
  "description": "Leading technology company focused on innovation",
  "email": "contact@techcorp.com",
  "phone": "+1234567890",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "size": "MEDIUM",
  "address": "123 Tech Street, Silicon Valley, CA",
  "contactPerson": "John Doe",
  "isVerified": false,
  "isActive": true,
  "createdAt": "2025-12-28T10:30:00",
  "updatedAt": "2025-12-28T10:30:00"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp Solutions",
    "description": "Leading technology company",
    "email": "contact@techcorp.com",
    "industry": "Technology",
    "size": "MEDIUM"
  }'
```

---

### 2. Get All Companies
**Endpoint:** `GET /companies`

**Description:** Retrieve all registered companies

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechCorp Solutions",
    "industry": "Technology",
    "isVerified": true,
    "isActive": true
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "HealthTech Plus",
    "industry": "Healthcare",
    "isVerified": true,
    "isActive": true
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/companies
```

---

### 3. Get Verified Companies Only
**Endpoint:** `GET /companies/verified`

**Description:** Retrieve only verified companies

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechCorp Solutions",
    "industry": "Technology",
    "isVerified": true,
    "isActive": true
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/companies/verified
```

---

### 4. Get Company by ID
**Endpoint:** `GET /companies/{id}`

**Description:** Retrieve specific company details

**Path Parameters:**
- `id`: Company UUID

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "TechCorp Solutions",
  "description": "Leading technology company focused on innovation",
  "email": "contact@techcorp.com",
  "phone": "+1234567890",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "size": "MEDIUM",
  "address": "123 Tech Street, Silicon Valley, CA",
  "contactPerson": "John Doe",
  "isVerified": true,
  "isActive": true,
  "createdAt": "2025-12-28T10:30:00",
  "updatedAt": "2025-12-28T10:30:00"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/companies/550e8400-e29b-41d4-a716-446655440000
```

---

## 👤 USER AUTHENTICATION ENDPOINTS

### 5. Register User
**Endpoint:** `POST /users`

**Description:** Register a new user on the platform

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Jane Smith",
  "department": "Engineering",
  "role": "Software Engineer"
}
```

**Field Descriptions:**
- `email` (required): User email address (unique)
- `fullName` (required): User's full name
- `department` (optional): Department name
- `role` (optional): Job role/title

**Response:** `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "email": "user@example.com",
  "fullName": "Jane Smith",
  "department": "Engineering",
  "role": "Software Engineer",
  "totalPoints": 0,
  "ideasSubmitted": 0,
  "ideasImplemented": 0,
  "createdAt": "2025-12-28T10:30:00"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "fullName": "Jane Smith",
    "department": "Engineering",
    "role": "Software Engineer"
  }'
```

---

### 6. Login / Authenticate User
**Endpoint:** `GET /users/email/{email}`

**Description:** Authenticate user by email (simplified authentication)

**Path Parameters:**
- `email`: User email address

**Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "email": "user@example.com",
  "fullName": "Jane Smith",
  "department": "Engineering",
  "role": "Software Engineer",
  "totalPoints": 150,
  "ideasSubmitted": 5,
  "ideasImplemented": 2,
  "createdAt": "2025-12-28T10:30:00"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/users/email/user@example.com
```

---

## 🎯 CHALLENGE ENDPOINTS (For Companies)

### 7. Create Challenge
**Endpoint:** `POST /challenges`

**Description:** Company creates a new challenge

**Request Body:**
```json
{
  "title": "Optimize Cloud Infrastructure",
  "description": "We need innovative solutions to reduce cloud costs by 30%",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "difficulty": "INTERMEDIATE",
  "rewardAmount": "5000",
  "solution": "Implement auto-scaling and serverless architecture",
  "isActive": true
}
```

**Field Descriptions:**
- `title` (required): Challenge title
- `description` (required): Detailed challenge description
- `companyId` (required): Company UUID
- `difficulty` (required): `BEGINNER`, `INTERMEDIATE`, or `EXPERT`
- `rewardAmount` (optional): Reward amount in credits/currency
- `solution` (required): Company's internal solution (for AI comparison)
- `isActive` (optional): Active status (default: true)

**Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "title": "Optimize Cloud Infrastructure",
  "description": "We need innovative solutions to reduce cloud costs by 30%",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "companyName": "TechCorp Solutions",
  "difficulty": "INTERMEDIATE",
  "rewardAmount": "5000",
  "isActive": true,
  "currentSubmissions": 0,
  "createdAt": "2025-12-28T10:30:00"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Optimize Cloud Infrastructure",
    "description": "Reduce cloud costs by 30%",
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "difficulty": "INTERMEDIATE",
    "solution": "Implement auto-scaling"
  }'
```

---

### 8. Get Company's Challenges
**Endpoint:** `GET /challenges/company/{companyId}`

**Description:** Get all challenges created by a specific company

**Path Parameters:**
- `companyId`: Company UUID

**Response:** `200 OK`
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "title": "Optimize Cloud Infrastructure",
    "difficulty": "INTERMEDIATE",
    "currentSubmissions": 15,
    "isActive": true
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/challenges/company/550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 POSTMAN COLLECTION

### Import into Postman:
1. Create new collection: "Innovation Platform API"
2. Add requests for each endpoint above
3. Set base URL variable: `{{baseUrl}}` = `http://localhost:8080/api`

---

## 🔐 AUTHENTICATION NOTES

**Current Implementation:**
- Simplified authentication using email lookup
- No password required (for development)
- No JWT tokens (yet)

**For Production:**
- Implement proper authentication with passwords
- Add JWT token-based authentication
- Implement refresh tokens
- Add role-based access control (RBAC)

---

## ⚠️ ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "timestamp": "2025-12-28T10:30:00"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Company not found with id: 550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-28T10:30:00"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2025-12-28T10:30:00"
}
```

---

## 🧪 TESTING WORKFLOW

### 1. Register Company
```bash
POST /companies
```

### 2. Get Company ID from response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Create Challenge for Company
```bash
POST /challenges
# Use companyId from step 2
```

### 4. Register User
```bash
POST /users
```

### 5. Login User
```bash
GET /users/email/{email}
```

### 6. Submit Idea to Challenge
```bash
POST /challenges/ideas
```

---

## 📚 ADDITIONAL RESOURCES

- **Architecture Diagram:** See `ARCHITECTURE_DIAGRAM.md`
- **Quick Start Guide:** See `QUICK_START.md`
- **Project Structure:** See `PROJECT_STRUCTURE.md`

---

**Last Updated:** December 28, 2025
**API Version:** 1.0
**Base URL:** http://localhost:8080/api
