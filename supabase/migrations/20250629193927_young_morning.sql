/*
  # Fix User Signup Database Error

  This migration ensures that user signup works correctly by:
  1. Properly setting up the user_profiles table
  2. Fixing the user profile creation trigger
  3. Ensuring RLS policies don't block user creation
  4. Adding proper error handling for edge cases
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure user_profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint only if auth.users exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- Drop existing constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'user_profiles_id_fkey' 
      AND table_name = 'user_profiles'
    ) THEN
      ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
    END IF;
    
    -- Add the constraint back
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      now(),
      now()
    );
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.user_profiles 
      SET 
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        updated_at = now()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user signup (only if auth.users exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- Create new trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Ensure other essential tables exist for the application to work
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  event text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add foreign keys for other tables if auth.users exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    
    -- Add foreign key for resumes.user_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'resumes_user_id_fkey' 
      AND table_name = 'resumes'
    ) THEN
      ALTER TABLE resumes 
      ADD CONSTRAINT resumes_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for analytics.user_id if it doesn't exist
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

-- Enable RLS on other tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create basic policies for resumes
DROP POLICY IF EXISTS "Users can manage own resumes" ON resumes;
CREATE POLICY "Users can manage own resumes"
  ON resumes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create basic policy for analytics
DROP POLICY IF EXISTS "Users can insert analytics" ON analytics;
CREATE POLICY "Users can insert analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);

-- Create trigger for resumes updated_at
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();