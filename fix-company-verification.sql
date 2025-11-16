-- Fix Company Verification Issue
-- Run this in MySQL Workbench or command line

USE Company_Service;

-- First, let's see what companies exist
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

-- Insert or update the test company to be verified
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

-- Verify the company was created/updated
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

-- Show all companies for verification
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