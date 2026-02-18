-- Esencelab Database Setup
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

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User credentials table (for password storage)
CREATE TABLE public.user_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  skills JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  resume_url TEXT,
  match_score INTEGER DEFAULT 0,
  status candidate_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- Candidates policies
CREATE POLICY "Candidates are viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Users can insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update candidates" ON public.candidates FOR UPDATE USING (true);

-- Applications policies
CREATE POLICY "Applications are viewable by everyone" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Users can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update applications" ON public.applications FOR UPDATE USING (true);

-- Courses policies
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (true);

-- Activity logs policies
CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Insert sample courses
INSERT INTO public.courses (title, provider, url, skills, duration, level, rating) VALUES
('Advanced Python for Data Science', 'DataCamp', 'https://datacamp.com', ARRAY['Python', 'Pandas', 'NumPy', 'Matplotlib'], '4 weeks', 'intermediate', 4.5),
('SQL for Data Analysis', 'Mode Analytics', 'https://mode.com', ARRAY['SQL', 'Database Design', 'Query Optimization'], '3 weeks', 'beginner', 4.3),
('React Patterns and Best Practices', 'Frontend Masters', 'https://frontendmasters.com', ARRAY['React', 'Hooks', 'Context', 'Performance'], '6 weeks', 'advanced', 4.8),
('Machine Learning Fundamentals', 'Coursera', 'https://coursera.org', ARRAY['ML', 'Python', 'Scikit-learn', 'Statistics'], '12 weeks', 'intermediate', 4.6),
('System Design Interview', 'Educative', 'https://educative.io', ARRAY['System Design', 'Architecture', 'Scalability'], '8 weeks', 'advanced', 4.7);

-- Insert sample jobs
INSERT INTO public.jobs (employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type) VALUES
(NULL, 'Software Engineer Intern', 'TechCorp', 'San Francisco, CA', 'Build scalable web applications using modern technologies', ARRAY['Currently enrolled in CS program', 'Python or JavaScript experience', 'Git knowledge'], ARRAY['Python', 'JavaScript', 'React', 'Git', 'SQL'], 30, 40, 'internship'),
(NULL, 'Data Analyst', 'DataFlow', 'New York, NY', 'Analyze large datasets to drive business decisions', ARRAY['BS in Statistics or related field', 'SQL proficiency', 'Data visualization skills'], ARRAY['SQL', 'Python', 'Pandas', 'Tableau', 'Excel'], 70000, 90000, 'full-time'),
(NULL, 'Frontend Developer', 'WebScale', 'Remote', 'Create beautiful, responsive user interfaces', ARRAY['3+ years experience', 'React expertise', 'CSS/SASS proficiency'], ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Figma'], 100000, 140000, 'full-time'),
(NULL, 'Machine Learning Engineer', 'AI Labs', 'Boston, MA', 'Build and deploy ML models at scale', ARRAY['MS/PhD in CS or related field', 'PyTorch/TensorFlow experience', 'Strong math background'], ARRAY['Python', 'PyTorch', 'TensorFlow', 'ML', 'Statistics'], 130000, 180000, 'full-time'),
(NULL, 'Backend Engineer', 'CloudSystems', 'Austin, TX', 'Design and build scalable backend services', ARRAY['5+ years backend experience', 'Go or Python proficiency', 'Database design skills'], ARRAY['Go', 'Python', 'PostgreSQL', 'Redis', 'AWS'], 120000, 160000, 'full-time');

-- Insert sample candidates
INSERT INTO public.candidates (name, email, role, skills, education, experience, match_score, status) VALUES
('Jordan Lee', 'jordan@demo.com', 'Frontend Developer', '[{"name": "React", "score": 92, "category": "technical"}, {"name": "TypeScript", "score": 88, "category": "technical"}, {"name": "CSS", "score": 85, "category": "technical"}]', '[{"institution": "UC Berkeley", "degree": "BS", "field": "Computer Science", "startDate": "2020", "endDate": "2024"}]', '[{"company": "StartupX", "title": "Frontend Intern", "description": "Built React components", "startDate": "2023", "endDate": "2023"}]', 94, 'screening'),
('Morgan Smith', 'morgan@demo.com', 'Data Analyst', '[{"name": "Python", "score": 90, "category": "technical"}, {"name": "SQL", "score": 87, "category": "technical"}, {"name": "Tableau", "score": 82, "category": "technical"}]', '[{"institution": "NYU", "degree": "BS", "field": "Statistics", "startDate": "2019", "endDate": "2023"}]', '[{"company": "BankCo", "title": "Data Intern", "description": "Analyzed financial data", "startDate": "2022", "endDate": "2023"}]', 89, 'new'),
('Casey Park', 'casey@demo.com', 'ML Engineer', '[{"name": "Python", "score": 95, "category": "technical"}, {"name": "PyTorch", "score": 88, "category": "technical"}, {"name": "Statistics", "score": 85, "category": "domain"}]', '[{"institution": "MIT", "degree": "MS", "field": "Computer Science", "startDate": "2021", "endDate": "2023"}]', '[{"company": "Research Lab", "title": "Research Assistant", "description": "Published ML papers", "startDate": "2022", "endDate": "2023"}]', 91, 'interview');

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
