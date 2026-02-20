-- Complete Esencelab Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
    CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
    CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'hired', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level') THEN
    CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
END $$;

-- Profiles Table (main user table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  job_type job_type DEFAULT 'full-time',
  status job_status DEFAULT 'active',
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  clerk_user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  skills JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  resume_url TEXT,
  resume_text TEXT,
  match_score INTEGER DEFAULT 0,
  status candidate_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  url TEXT,
  skills TEXT[] DEFAULT '{}',
  duration TEXT,
  level course_level,
  rating DECIMAL(3,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  clerk_user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_clerk_user_id ON candidates(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE USING (true);

-- RLS Policies for Jobs
CREATE POLICY "jobs_select_policy" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_policy" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "jobs_update_policy" ON jobs FOR UPDATE USING (true);
CREATE POLICY "jobs_delete_policy" ON jobs FOR DELETE USING (true);

-- RLS Policies for Candidates
CREATE POLICY "candidates_select_policy" ON candidates FOR SELECT USING (true);
CREATE POLICY "candidates_insert_policy" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "candidates_update_policy" ON candidates FOR UPDATE USING (true);
CREATE POLICY "candidates_delete_policy" ON candidates FOR DELETE USING (true);

-- RLS Policies for Applications
CREATE POLICY "applications_select_policy" ON applications FOR SELECT USING (true);
CREATE POLICY "applications_insert_policy" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "applications_update_policy" ON applications FOR UPDATE USING (true);
CREATE POLICY "applications_delete_policy" ON applications FOR DELETE USING (true);

-- RLS Policies for Courses
CREATE POLICY "courses_select_policy" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_policy" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "courses_update_policy" ON courses FOR UPDATE USING (true);
CREATE POLICY "courses_delete_policy" ON courses FOR DELETE USING (true);

-- RLS Policies for Activity Logs
CREATE POLICY "activity_logs_select_policy" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert_policy" ON activity_logs FOR INSERT WITH CHECK (true);
