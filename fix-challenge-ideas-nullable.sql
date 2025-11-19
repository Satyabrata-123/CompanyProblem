-- Fix challenge_ideas table to allow null challenge_id for community ideas
-- This allows users to submit ideas that are not tied to a specific challenge

-- Make challenge_id nullable
ALTER TABLE challenge_ideas 
ALTER COLUMN challenge_id DROP NOT NULL;

-- Fix current_submissions to have default value of 0 in all challenge tables
-- This prevents NullPointerException when incrementing submissions

-- Beginner challenges
UPDATE beginner_challenges 
SET current_submissions = 0 
WHERE current_submissions IS NULL;

ALTER TABLE beginner_challenges 
ALTER COLUMN current_submissions SET DEFAULT 0;

ALTER TABLE beginner_challenges 
ALTER COLUMN current_submissions SET NOT NULL;

-- Intermediate challenges
UPDATE intermediate_challenges 
SET current_submissions = 0 
WHERE current_submissions IS NULL;

ALTER TABLE intermediate_challenges 
ALTER COLUMN current_submissions SET DEFAULT 0;

ALTER TABLE intermediate_challenges 
ALTER COLUMN current_submissions SET NOT NULL;

-- Expert challenges
UPDATE expert_challenges 
SET current_submissions = 0 
WHERE current_submissions IS NULL;

ALTER TABLE expert_challenges 
ALTER COLUMN current_submissions SET DEFAULT 0;

ALTER TABLE expert_challenges 
ALTER COLUMN current_submissions SET NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'challenge_ideas' 
AND column_name = 'challenge_id';

SELECT 
    'beginner_challenges' as table_name,
    column_name, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'beginner_challenges' 
AND column_name = 'current_submissions'
UNION ALL
SELECT 
    'intermediate_challenges' as table_name,
    column_name, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'intermediate_challenges' 
AND column_name = 'current_submissions'
UNION ALL
SELECT 
    'expert_challenges' as table_name,
    column_name, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'expert_challenges' 
AND column_name = 'current_submissions';

-- Show current challenge ideas
SELECT 
    id,
    challenge_id,
    challenge_difficulty,
    title,
    user_name,
    status,
    submitted_at
FROM challenge_ideas
ORDER BY submitted_at DESC
LIMIT 10;
