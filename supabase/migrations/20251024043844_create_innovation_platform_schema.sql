/*
  # Employee Innovation Platform Database Schema

  ## Overview
  This migration creates the complete database schema for the employee innovation management platform.
  
  ## New Tables Created
  
  ### 1. users
  - `id` (uuid, primary key) - Unique identifier for each user
  - `email` (text, unique, not null) - User's email address
  - `full_name` (text, not null) - User's full name
  - `department` (text) - User's department
  - `role` (text, not null, default 'employee') - User role (employee, manager, admin)
  - `total_points` (integer, default 0) - Gamification points earned
  - `ideas_submitted` (integer, default 0) - Count of ideas submitted
  - `ideas_implemented` (integer, default 0) - Count of ideas implemented
  - `created_at` (timestamptz, default now()) - Account creation timestamp
  
  ### 2. ideas
  - `id` (uuid, primary key) - Unique identifier for each idea
  - `title` (text, not null) - Idea title
  - `description` (text, not null) - Detailed description
  - `category` (text) - AI-assigned category
  - `status` (text, not null, default 'SUBMITTED') - Workflow status
  - `submitted_by` (uuid, not null, foreign key) - References users table
  - `vote_count` (integer, default 0) - Total votes received
  - `comment_count` (integer, default 0) - Total comments
  - `ai_score` (numeric) - AI-calculated quality score
  - `tags` (text[]) - Array of tags
  - `created_at` (timestamptz, default now()) - Submission timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp
  
  ### 3. votes
  - `id` (uuid, primary key) - Unique identifier for each vote
  - `idea_id` (uuid, not null, foreign key) - References ideas table
  - `user_id` (uuid, not null, foreign key) - References users table
  - `vote_type` (integer, not null) - Vote value (1 for upvote, -1 for downvote)
  - `created_at` (timestamptz, default now()) - Vote timestamp
  - Unique constraint on (idea_id, user_id) - One vote per user per idea
  
  ### 4. comments
  - `id` (uuid, primary key) - Unique identifier for each comment
  - `idea_id` (uuid, not null, foreign key) - References ideas table
  - `user_id` (uuid, not null, foreign key) - References users table
  - `content` (text, not null) - Comment text
  - `created_at` (timestamptz, default now()) - Comment timestamp
  
  ### 5. badges
  - `id` (uuid, primary key) - Unique identifier for each badge
  - `name` (text, not null) - Badge name
  - `description` (text) - Badge description
  - `icon_url` (text) - URL to badge icon
  - `points_required` (integer) - Points needed to earn badge
  - `created_at` (timestamptz, default now()) - Badge creation timestamp
  
  ### 6. user_badges
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, not null, foreign key) - References users table
  - `badge_id` (uuid, not null, foreign key) - References badges table
  - `earned_at` (timestamptz, default now()) - When badge was earned
  
  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Policies are created for authenticated users to:
    - Read their own data and public data
    - Create new ideas, votes, and comments
    - Update their own content
    - Prevent unauthorized data access
  
  ## Important Notes
  - All foreign keys have ON DELETE CASCADE for data integrity
  - Indexes are created on frequently queried columns
  - Default values ensure data consistency
  - Timestamps are automatically managed
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department text,
  role text NOT NULL DEFAULT 'employee',
  total_points integer DEFAULT 0,
  ideas_submitted integer DEFAULT 0,
  ideas_implemented integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'SUBMITTED',
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  ai_score numeric,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_url text,
  points_required integer,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_submitted_by ON ideas(submitted_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for ideas table
CREATE POLICY "Anyone can view ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update own ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Managers can update any idea status"
  ON ideas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for votes table
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for badges table
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for user_badges table
CREATE POLICY "Anyone can view user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can award badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);
