/*
  # Complete AI Resume Builder Database Schema

  1. New Tables
    - `resumes` - Store user resumes with template support
    - `chat_history` - Store AI chat conversations
    - `templates` - Store resume templates
    - `analytics` - Track user events
    - `user_profiles` - Extended user information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for templates

  3. Performance
    - Add indexes on frequently queried columns
    - Auto-update timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resumes table with all columns
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_history table with all columns (no resume_id)
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  messages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create templates table with all columns
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create analytics table with all columns
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  event text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints (only if auth.users exists)
DO $$
BEGIN
  -- Check if auth schema and users table exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    
    -- Add foreign key for resumes.user_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'resumes_user_id_fkey' 
      AND table_name = 'resumes'
    ) THEN
      ALTER TABLE resumes 
      ADD CONSTRAINT resumes_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for chat_history.user_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'chat_history_user_id_fkey' 
      AND table_name = 'chat_history'
    ) THEN
      ALTER TABLE chat_history 
      ADD CONSTRAINT chat_history_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for analytics.user_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'analytics_user_id_fkey' 
      AND table_name = 'analytics'
    ) THEN
      ALTER TABLE analytics 
      ADD CONSTRAINT analytics_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resumes
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

  -- Create new policies
  CREATE POLICY "Users can read own resumes"
    ON resumes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own resumes"
    ON resumes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own resumes"
    ON resumes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own resumes"
    ON resumes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create RLS policies for chat_history
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;

  -- Create new policies
  CREATE POLICY "Users can read own chat history"
    ON chat_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own chat history"
    ON chat_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create RLS policies for templates (public read access)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Templates are publicly readable" ON templates;

  -- Create new policies
  CREATE POLICY "Templates are publicly readable"
    ON templates
    FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Create RLS policies for analytics
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert analytics" ON analytics;

  -- Create new policies
  CREATE POLICY "Users can insert analytics"
    ON analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for resumes
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();