# Challenge Creation Troubleshooting Guide

## Common Error: "Only verified companies can create challenges"

This error occurs when trying to create a challenge with a company that isn't verified in the database.

### Quick Fix (For Testing)

1. **Run the setup script:**
   ```powershell
   .\setup-verified-company.ps1
   ```

2. **Or manually set up test data:**
   ```sql
   USE Company_Service;
   
   INSERT INTO companies (
       id, name, description, email, phone, website, industry, size, 
       address, contact_person, is_verified, is_active, created_at, updated_at
   ) VALUES (
       UNHEX(REPLACE('550e8400-e29b-41d4-a716-446655440000', '-', '')),
       'Test Tech Company', 'A verified test company', 'test@company.com',
       '+1-555-0123', 'https://testcompany.com', 'Technology', 'MEDIUM',
       '123 Test Street, Test City, TC 12345', 'John Doe',
       TRUE, TRUE, NOW(), NOW()
   ) ON DUPLICATE KEY UPDATE is_verified = TRUE, is_active = TRUE;
   ```

3. **Set the company in localStorage:**
   ```javascript
   localStorage.setItem('currentUser', JSON.stringify({
       companyId: '550e8400-e29b-41d4-a716-446655440000',
       companyName: 'Test Tech Company',
       role: 'company'
   }));
   ```

### Testing Steps

1. **Open the test page:**
   - Navigate to `frontend/test-company-verification.html`
   - Click "Check All Companies" to see available companies
   - Click "Check Test Company" to verify the test company exists and is verified

2. **Set current company:**
   - Use the company ID: `550e8400-e29b-41d4-a716-446655440000`
   - Click "Set as Current Company"

3. **Create test challenge:**
   - Fill out the form with test data
   - Click "Create Test Challenge"
   - Should succeed if company is verified

## Other Common Issues

### 1. Company Not Found
**Error:** "Company not found"
**Solution:** 
- Make sure the company exists in the database
- Check that the company ID in localStorage matches a real company
- Run the setup script to create test data

### 2. Database Connection Issues
**Error:** Connection refused or timeout errors
**Solution:**
- Ensure MySQL is running
- Check that the Company_Service database exists
- Verify the company-service is running on port 8086

### 3. API Gateway Issues
**Error:** 404 Not Found on /api/challenges
**Solution:**
- Check that API Gateway is running on port 8080
- Verify the routing configuration in `api-gateway/src/main/resources/application.yml`
- Ensure company-service is registered with the gateway

### 4. Frontend Issues
**Error:** "window.app.api is not defined"
**Solution:**
- Make sure you're accessing the page through the proper frontend server
- Check that the API client is properly initialized in main.js

## Complete Workflow Test

### Step 1: Start All Services
```powershell
.\start-services.ps1
```

### Step 2: Setup Test Data
```powershell
.\setup-verified-company.ps1
```

### Step 3: Test Company Registration Flow
1. Go to `http://localhost:3000`
2. Navigate to Company Dashboard
3. Register or login with test company
4. Try creating a challenge

### Step 4: Test Challenge Creation
1. Use the test page: `frontend/test-company-verification.html`
2. Follow the step-by-step process
3. Verify challenge appears in the challenges list

## API Endpoints for Manual Testing

### Check Companies
```http
GET http://localhost:8080/api/companies
```

### Check Specific Company
```http
GET http://localhost:8080/api/companies/550e8400-e29b-41d4-a716-446655440000
```

### Create Challenge
```http
POST http://localhost:8080/api/challenges
Content-Type: application/json

{
  "challenge": {
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Test Challenge",
    "description": "A test challenge",
    "requirements": "Basic requirements",
    "difficulty": "INTERMEDIATE",
    "submissionDeadline": "2024-12-31T23:59:59",
    "rewardCurrency": "USD"
  },
  "internalSolutionBrief": "Internal solution details"
}
```

### List Challenges
```http
GET http://localhost:8080/api/challenges
```

## Database Verification Queries

### Check Company Status
```sql
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_uuid,
    name, email, is_verified, is_active
FROM companies;
```

### Check Challenges
```sql
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as challenge_uuid,
    title, difficulty, is_active, created_at
FROM challenges;
```

## Need Help?

If you're still having issues:

1. Check the browser console for JavaScript errors
2. Check the company-service logs for backend errors
3. Verify all services are running with `.\start-services.ps1`
4. Use the test page to isolate the issue
5. Check the database directly with the SQL queries above