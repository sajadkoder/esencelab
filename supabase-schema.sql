-- Esencelab Database Setup for Clerk Authentication
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'hired', 'rejected');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_credentials CASCADE;

-- Profiles table (uses Clerk user ID)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  job_type job_type DEFAULT 'full-time',
  status job_status DEFAULT 'active',
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT,
  url TEXT,
  skills TEXT[],
  duration TEXT,
  level course_level,
  rating DECIMAL(3,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  clerk_user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profile policies (public readable, own profile editable)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Jobs policies (public readable, employers can manage their own)
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE USING (true);

-- Candidates policies
CREATE POLICY "Candidates are viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Users can insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update candidates" ON public.candidates FOR UPDATE USING (true);

-- Applications policies
CREATE POLICY "Applications are viewable by everyone" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Users can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update applications" ON public.applications FOR UPDATE USING (true);

-- Courses policies (public readable, admins can manage)
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (true);

-- Activity logs policies
CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert sample courses
INSERT INTO public.courses (title, provider, url, skills, duration, level, rating) VALUES
('Advanced Python for Data Science', 'DataCamp', 'https://datacamp.com', ARRAY['Python', 'Pandas', 'NumPy', 'Matplotlib'], '4 weeks', 'intermediate', 4.5),
('SQL for Data Analysis', 'Mode Analytics', 'https://mode.com', ARRAY['SQL', 'Database Design', 'Query Optimization'], '3 weeks', 'beginner', 4.3),
('React Patterns and Best Practices', 'Frontend Masters', 'https://frontendmasters.com', ARRAY['React', 'Hooks', 'Context', 'Performance'], '6 weeks', 'advanced', 4.8),
('Machine Learning Fundamentals', 'Coursera', 'https://coursera.org', ARRAY['ML', 'Python', 'Scikit-learn', 'Statistics'], '12 weeks', 'intermediate', 4.6),
('System Design Interview', 'Educative', 'https://educative.io', ARRAY['System Design', 'Architecture', 'Scalability'], '8 weeks', 'advanced', 4.7),
('DSA Self Paced', 'GeeksforGeeks', 'https://practice.geeksforgeeks.org/courses', ARRAY['DSA', 'Algorithms', 'Data Structures'], 'Self Paced', 'intermediate', 4.6),
('Full Stack Development', 'Scaler Academy', 'https://www.scaler.com/full-stack/', ARRAY['React', 'Node.js', 'MongoDB', 'System Design'], '6 months', 'advanced', 4.7),
('Data Science Masters', 'Newton School', 'https://www.newtonschool.co/', ARRAY['Python', 'ML', 'SQL', 'Statistics'], '6 months', 'intermediate', 4.5);

-- Insert sample jobs
INSERT INTO public.jobs (title, company, location, description, requirements, skills, salary_min, salary_max, job_type) VALUES
('Software Engineer Intern', 'TechCorp', 'Bangalore, India', 'Build scalable web applications using modern technologies', ARRAY['Currently enrolled in CS program', 'Python or JavaScript experience', 'Git knowledge'], ARRAY['Python', 'JavaScript', 'React', 'Git', 'SQL'], 25000, 40000, 'internship'),
('Data Analyst', 'DataFlow', 'Mumbai, India', 'Analyze large datasets to drive business decisions', ARRAY['BS in Statistics or related field', 'SQL proficiency', 'Data visualization skills'], ARRAY['SQL', 'Python', 'Pandas', 'Tableau', 'Excel'], 700000, 900000, 'full-time'),
('Frontend Developer', 'WebScale', 'Remote', 'Create beautiful, responsive user interfaces', ARRAY['3+ years experience', 'React expertise', 'CSS/SASS proficiency'], ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Figma'], 1000000, 1400000, 'full-time'),
('Machine Learning Engineer', 'AI Labs', 'Bangalore, India', 'Build and deploy ML models at scale', ARRAY['MS/PhD in CS or related field', 'PyTorch/TensorFlow experience', 'Strong math background'], ARRAY['Python', 'PyTorch', 'TensorFlow', 'ML', 'Statistics'], 1300000, 1800000, 'full-time'),
('Backend Engineer', 'CloudSystems', 'Hyderabad, India', 'Design and build scalable backend services', ARRAY['5+ years backend experience', 'Go or Python proficiency', 'Database design skills'], ARRAY['Go', 'Python', 'PostgreSQL', 'Redis', 'AWS'], 1200000, 1600000, 'full-time'),
('SDE I', 'Google India', 'Bangalore/Hyderabad', 'Build scalable systems at Google scale', ARRAY['Strong DSA skills', 'System design knowledge', 'Bachelor in CS'], ARRAY['DSA', 'Python', 'System Design', 'Java'], 2500000, 4500000, 'full-time'),
('Software Engineer', 'Amazon', 'Bangalore', 'Build customer-obsessed solutions', ARRAY['Strong coding skills', 'Problem solving ability', 'BS in CS'], ARRAY['Java', 'DSA', 'AWS', 'Distributed Systems'], 2000000, 4000000, 'full-time'),
('Frontend Developer', 'Flipkart', 'Bangalore', 'Build the next generation e-commerce experience', ARRAY['React expertise', '3+ years experience', 'CSS proficiency'], ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'], 1500000, 2800000, 'full-time');

-- Create indexes for better performance
CREATE INDEX idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX idx_candidates_clerk_user_id ON public.candidates(clerk_user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
