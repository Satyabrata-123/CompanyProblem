-- Fix Boolean Column Storage Issue
-- Convert BIT(1) columns to proper TINYINT(1) for boolean values

USE Company_Service;

-- First, let's see the current column definitions
DESCRIBE companies;

-- Check the current data types
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'Company_Service' 
AND TABLE_NAME = 'companies' 
AND COLUMN_NAME IN ('is_verified', 'is_active');

-- Show current data with hex values
SELECT 
    name,
    email,
    HEX(is_verified) as is_verified_hex,
    HEX(is_active) as is_active_hex,
    is_verified,
    is_active
FROM companies;

-- Fix the column types to proper TINYINT(1) for boolean
ALTER TABLE companies 
MODIFY COLUMN is_verified TINYINT(1) DEFAULT 0;

ALTER TABLE companies 
MODIFY COLUMN is_active TINYINT(1) DEFAULT 1;

-- Update your existing company to be verified
UPDATE companies 
SET 
    is_verified = 1,
    is_active = 1,
    updated_at = NOW()
WHERE contact_person = 'Satyabrata Mallik' 
   OR email = 'satya1@gmail.com';

-- Verify the fix worked
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

-- Check the new column definitions
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'Company_Service' 
AND TABLE_NAME = 'companies' 
AND COLUMN_NAME IN ('is_verified', 'is_active');