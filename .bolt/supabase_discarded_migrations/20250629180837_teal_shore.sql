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

-- Create chat_history table
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
  description text,
  category text NOT NULL,
  level text NOT NULL,
  data jsonb NOT NULL,
  tags text[],
  preview text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

    -- Add foreign key for user_profiles.id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'user_profiles_id_fkey' 
      AND table_name = 'user_profiles'
    ) THEN
      ALTER TABLE user_profiles 
      ADD CONSTRAINT user_profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resumes
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
  DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

  -- Create new policies
  CREATE POLICY "Users can view own resumes"
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
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

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
  DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;

  -- Create new policies
  CREATE POLICY "Users can view own chat history"
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
  -- Make sure the column exists before creating the policy
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'templates' AND column_name = 'is_active'
  ) THEN
    CREATE POLICY "Templates are publicly readable"
      ON templates
      FOR SELECT
      TO authenticated
      USING (is_active = true);
  ELSE
    CREATE POLICY "Templates are publicly readable"
      ON templates
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create RLS policies for analytics
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;

  -- Create new policies
  CREATE POLICY "Users can insert own analytics"
    ON analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create RLS policies for user_profiles
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

  -- Create new policies
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
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_level ON templates(level);
-- Only create this index if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'templates' AND column_name = 'is_active'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
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

-- Trigger to create profile on user signup (only if auth.users exists)
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

-- Insert some sample templates (optional)
INSERT INTO templates (name, description, category, level, data, tags, preview, is_active)
VALUES 
(
  'Software Engineer Template',
  'Professional template for software engineers with technical skills focus',
  'technology',
  'mid',
  '{
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.dev",
      "summary": "Experienced Software Engineer with 5+ years developing scalable web applications. Expertise in React, Node.js, and cloud technologies."
    },
    "experience": [],
    "education": [],
    "skills": [],
    "projects": []
  }',
  ARRAY['software', 'engineering', 'technology', 'react', 'nodejs'],
  'Professional software engineer template with modern tech stack',
  true
)
ON CONFLICT (id) DO NOTHING;