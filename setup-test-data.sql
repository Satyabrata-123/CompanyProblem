-- Setup Test Data for Company Challenge System
-- Run this script in MySQL after creating the Company_Service database

USE Company_Service;

-- Check if tables exist
SHOW TABLES;

-- If companies table doesn't exist, the service hasn't started yet
-- Start the company-service first, then run this script

-- Insert a test company (replace with actual UUID if needed)
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
    'A test company for development purposes',
    'test@company.com',
    '+1-555-0123',
    'https://testcompany.com',
    'Technology',
    'MEDIUM',
    '123 Test Street, Test City, TC 12345',
    'John Doe',
    TRUE,  -- Important: Set to verified so they can create challenges
    TRUE,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE name = name; -- Avoid duplicate key errors

-- Verify the company was inserted
SELECT 
    HEX(id) as id_hex,
    name,
    email,
    is_verified,
    is_active
FROM companies;

-- Show the UUID in the format needed for frontend
SELECT 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_uuid,
    name,
    email
FROM companies;