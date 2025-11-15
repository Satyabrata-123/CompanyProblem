-- Database Setup Script for Company Challenge System
-- Run this script in MySQL to create the necessary databases

-- Create Company Service Database
CREATE DATABASE IF NOT EXISTS Company_Service;

-- Verify all databases exist
SHOW DATABASES LIKE '%_Service';

-- The following databases should already exist from your previous setup:
-- - Idea_Service (for ideas and solutions)
-- - User_Service (for user management)
-- - Voting_Service (for voting functionality)
-- - Gamification_Service (for points and badges)
-- - AI_Service (for AI features)

-- Note: Tables will be automatically created by Spring Boot JPA when services start
-- with ddl-auto: update configuration

-- Expected Tables in Company_Service:
-- - companies (company profiles and verification)
-- - challenges (company problem statements with difficulty levels)

-- Expected New Tables in Idea_Service:
-- - solutions (user solution submissions for challenges)

-- To verify tables after starting services, run:
-- USE Company_Service;
-- SHOW TABLES;
-- DESCRIBE companies;
-- DESCRIBE challenges;

-- USE Idea_Service;
-- SHOW TABLES;
-- DESCRIBE solutions;