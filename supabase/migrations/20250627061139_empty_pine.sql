/*
  # Complete Resume Builder Database Schema

  1. New Tables
    - `resumes` - Store user resume data
    - `chat_history` - Store AI chat conversations  
    - `templates` - Store resume templates
    - `analytics` - Track user events
    - `user_profiles` - Extended user information

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Foreign key constraints for data integrity

  3. Features
    - Auto-updating timestamps
    - User profile creation on signup
    - Optimized indexes for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_history table (simplified - no resume_id for now)
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  messages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  event text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints (only if auth.users exists)
ALTER TABLE resumes 
ADD CONSTRAINT IF NOT EXISTS resumes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_history 
ADD CONSTRAINT IF NOT EXISTS chat_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE analytics 
ADD CONSTRAINT IF NOT EXISTS analytics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE user_profiles 
ADD CONSTRAINT IF NOT EXISTS user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for resumes
CREATE POLICY "Users can read own resumes" ON resumes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for chat_history
CREATE POLICY "Users can read own chat history" ON chat_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON chat_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history" ON chat_history
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON chat_history
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for templates (public read)
CREATE POLICY "Templates are publicly readable" ON templates
  FOR SELECT TO authenticated
  USING (true);

-- Policies for analytics
CREATE POLICY "Users can insert analytics" ON analytics
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();