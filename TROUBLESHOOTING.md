# Troubleshooting Company Challenge System

## 🚨 **500 Internal Server Error on Challenge Creation**

### **Step 1: Check if Services are Running**

```bash
# Check if all services are running
netstat -an | findstr "8080 8081 8082 8083 8084 8085 8086"
```

You should see:
- `8080` - API Gateway
- `8081` - Idea Service  
- `8082` - User Service
- `8083` - Voting Service
- `8084` - Gamification Service
- `8085` - AI Service
- `8086` - Company Service ⭐

### **Step 2: Check Database Setup**

```sql
-- Connect to MySQL
mysql -u root -p

-- Check if Company_Service database exists
SHOW DATABASES LIKE 'Company_Service';

-- If it doesn't exist, create it
CREATE DATABASE IF NOT EXISTS Company_Service;

-- Check if tables exist
USE Company_Service;
SHOW TABLES;
-- Should show: companies, challenges
```

### **Step 3: Start Company Service**

If Company Service isn't running:

```bash
cd company-service
mvn spring-boot:run
```

Watch for these log messages:
```
✅ "Started CompanyServiceApplication"
✅ "create table companies"
✅ "create table challenges"
✅ "Registered with Eureka"
```

### **Step 4: Create Test Company**

```sql
-- Run the setup-test-data.sql script
mysql -u root -p < setup-test-data.sql
```

This creates a verified test company you can use.

### **Step 5: Update Frontend with Test Company ID**

After running the SQL script, get the company UUID:

```sql
USE Company_Service;
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_uuid
FROM companies;
```

Update your localStorage:
```javascript
// In browser console
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
currentUser.companyId = 'YOUR_COMPANY_UUID_HERE';
localStorage.setItem('currentUser', JSON.stringify(currentUser));
```

### **Step 6: Test API Endpoints**

Use the debug tools:

```
Open: frontend/debug-challenge-creation.html
1. Click "Check Backend Services"
2. Click "Test Company Endpoints" 
3. Click "Test Challenge Creation"
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: Company Service Not Running**
**Symptoms**: 404 errors on `/api/companies` or `/api/challenges`
**Solution**: 
```bash
cd company-service
mvn spring-boot:run
```

### **Issue 2: Database Not Created**
**Symptoms**: Service starts but tables don't exist
**Solution**:
```sql
CREATE DATABASE IF NOT EXISTS Company_Service;
```

### **Issue 3: Company Not Verified**
**Symptoms**: "Only verified companies can create challenges"
**Solution**:
```sql
USE Company_Service;
UPDATE companies SET is_verified = TRUE WHERE email = 'your-email@company.com';
```

### **Issue 4: Invalid Company ID**
**Symptoms**: "Company not found"
**Solution**: Make sure the `companyId` in localStorage matches a real company in the database.

### **Issue 5: API Gateway Not Routing**
**Symptoms**: 404 on all `/api/challenges` calls
**Solution**: Restart API Gateway after configuration changes:
```bash
cd api-gateway
mvn spring-boot:run
```

### **Issue 6: CORS Issues**
**Symptoms**: CORS errors in browser console
**Solution**: API Gateway already has CORS configured, but restart it if needed.

## 🛠️ **Quick Fix Commands**

### **Restart All Services:**
```bash
# Stop all Java processes (Windows)
taskkill /f /im java.exe

# Restart all services
start-services.bat
```

### **Reset Database:**
```sql
DROP DATABASE IF EXISTS Company_Service;
CREATE DATABASE Company_Service;
-- Then restart company-service to recreate tables
```

### **Check Service Logs:**
Look for these in the company-service console:
- ✅ `Started CompanyServiceApplication in X seconds`
- ✅ `Registered with Eureka`
- ❌ Any stack traces or error messages

## 📋 **Verification Checklist**

Before creating challenges, verify:

- [ ] Company Service running on port 8086
- [ ] API Gateway running on port 8080  
- [ ] Company_Service database exists
- [ ] Tables `companies` and `challenges` exist
- [ ] Test company exists and is verified
- [ ] User has `companyId` in localStorage
- [ ] API Gateway routes `/api/challenges` to company service

## 🎯 **Test Workflow**

1. **Register Company** → `/company/register`
2. **Verify Company** → Run SQL: `UPDATE companies SET is_verified = TRUE`
3. **Create Challenge** → `/company/challenges/create`
4. **Browse Challenges** → `/challenges`

## 📞 **Still Having Issues?**

1. Check service console logs for stack traces
2. Use `frontend/debug-challenge-creation.html` to test APIs
3. Verify database setup with `setup-test-data.sql`
4. Make sure all services are registered in Eureka: http://localhost:8761

The most common issue is that the company service isn't running or the company isn't verified in the database.