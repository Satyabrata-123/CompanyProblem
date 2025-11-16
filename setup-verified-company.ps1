Write-Host "Setting up verified test company..." -ForegroundColor Green

# Check if MySQL is available
try {
    $mysqlVersion = & mysql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "MySQL not found in PATH. Please ensure MySQL is installed and accessible." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "MySQL found: $mysqlVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error checking MySQL: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Database connection parameters
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "Company_Service"
$dbUser = "root"
$dbPassword = ""

Write-Host "Connecting to MySQL database..." -ForegroundColor Yellow

# Create the SQL commands
$sqlCommands = @"
USE $dbName;

-- Show current tables
SHOW TABLES;

-- Insert verified test company
INSERT INTO companies (
    id, 
    name, 
    description, 
    email, 
    phone, 
    website, 
    industry, 
    size, 
    address, 
    contact_person, 
    is_verified, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    UNHEX(REPLACE('550e8400-e29b-41d4-a716-446655440000', '-', '')),
    'Test Tech Company',
    'A verified test company for development and testing purposes',
    'test@company.com',
    '+1-555-0123',
    'https://testcompany.com',
    'Technology',
    'MEDIUM',
    '123 Test Street, Test City, TC 12345',
    'John Doe',
    TRUE,  -- VERIFIED = TRUE (this is crucial!)
    TRUE,  -- ACTIVE = TRUE
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    is_verified = TRUE,
    is_active = TRUE,
    updated_at = NOW();

-- Verify the company was inserted/updated
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_uuid,
    name,
    email,
    is_verified,
    is_active,
    created_at
FROM companies
WHERE name = 'Test Tech Company';

-- Show all companies
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_uuid,
    name,
    email,
    is_verified,
    is_active
FROM companies;
"@

# Save SQL to temporary file
$tempSqlFile = "temp_setup_company.sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    # Execute SQL commands
    if ($dbPassword -eq "") {
        Write-Host "Executing SQL commands (no password)..." -ForegroundColor Yellow
        Get-Content $tempSqlFile | & mysql -h $dbHost -P $dbPort -u $dbUser
    } else {
        Write-Host "Executing SQL commands (with password)..." -ForegroundColor Yellow
        Get-Content $tempSqlFile | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" -ForegroundColor Green
        Write-Host "✅ Test company setup completed successfully!" -ForegroundColor Green
        Write-Host "" -ForegroundColor Green
        Write-Host "Company Details:" -ForegroundColor Cyan
        Write-Host "  UUID: 550e8400-e29b-41d4-a716-446655440000" -ForegroundColor White
        Write-Host "  Name: Test Tech Company" -ForegroundColor White
        Write-Host "  Email: test@company.com" -ForegroundColor White
        Write-Host "  Verified: TRUE ✅" -ForegroundColor Green
        Write-Host "  Active: TRUE ✅" -ForegroundColor Green
        Write-Host "" -ForegroundColor Green
        Write-Host "You can now:" -ForegroundColor Yellow
        Write-Host "  1. Open frontend/test-company-verification.html in your browser" -ForegroundColor White
        Write-Host "  2. Test challenge creation with this verified company" -ForegroundColor White
        Write-Host "  3. Use the company dashboard at http://localhost:3000" -ForegroundColor White
    } else {
        Write-Host "❌ Error executing SQL commands. Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. MySQL server is running" -ForegroundColor White
        Write-Host "  2. Company_Service database exists" -ForegroundColor White
        Write-Host "  3. Company service has been started at least once (to create tables)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
} finally {
    # Clean up temporary file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile
    }
}

Write-Host ""
Read-Host "Press Enter to continue"