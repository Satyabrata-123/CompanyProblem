-- Fix the existing company verification issue
-- The is_verified and is_active fields are stored as binary/hex instead of proper boolean

USE Company_Service;

-- First, let's see the current state
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
    contact_person,
    HEX(is_verified) as is_verified_hex,
    HEX(is_active) as is_active_hex,
    is_verified,
    is_active
FROM companies;

-- Update the existing company to have proper boolean values
-- Convert the hex ID back to the proper format for the WHERE clause
UPDATE companies 
SET 
    is_verified = TRUE,
    is_active = TRUE,
    updated_at = NOW()
WHERE id = 0x4403909CA96940ED8D6C529AE432D9F2;

-- Alternative update using the name (in case the hex ID doesn't work)
UPDATE companies 
SET 
    is_verified = TRUE,
    is_active = TRUE,
    updated_at = NOW()
WHERE name = 'No' OR contact_person = 'Satyabrata Mallik';

-- Verify the update worked
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
    contact_person,
    is_verified,
    is_active,
    CASE 
        WHEN is_verified = 1 THEN 'VERIFIED ✅'
        ELSE 'NOT VERIFIED ❌'
    END as verification_status
FROM companies;

-- Show the company ID in the format needed for frontend
SELECT 
    'Use this Company ID in your frontend:' as instruction,
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21, 12)
    ) as company_id_for_frontend,
    name,
    email
FROM companies;