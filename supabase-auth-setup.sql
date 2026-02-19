-- Supabase Auth Database Setup
-- Run this in Supabase SQL Editor

-- Create profiles table that syncs with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT DEFAULT 'full-time',
  status TEXT DEFAULT 'active',
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE USING (true);

-- Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
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
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates are viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Users can insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update candidates" ON public.candidates FOR UPDATE USING (true);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applications are viewable by everyone" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Users can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update applications" ON public.applications FOR UPDATE USING (true);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT,
  url TEXT,
  skills TEXT[],
  duration TEXT,
  level TEXT,
  rating DECIMAL(3,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);

-- Insert sample data
INSERT INTO public.jobs (title, company, location, description, requirements, skills, salary_min, salary_max, job_type) VALUES
('SDE I', 'Google India', 'Bangalore/Hyderabad', 'Software Development Engineer', ARRAY['B.Tech/M.Tech', 'DSA', 'Problem Solving'], ARRAY['Python', 'Java', 'DSA', 'System Design'], 2500000, 4500000, 'full-time'),
('Software Engineer', 'Amazon', 'Bangalore', 'Full stack development', ARRAY['B.Tech', 'Coding skills'], ARRAY['Java', 'DSA', 'AWS', 'React'], 2000000, 4000000, 'full-time'),
('Frontend Developer', 'Flipkart', 'Bangalore', 'E-commerce platform', ARRAY['React', 'TypeScript'], ARRAY['React', 'TypeScript', 'CSS', 'Redux'], 1500000, 2800000, 'full-time'),
('Backend Developer', 'Cred', 'Bangalore', 'Fintech', ARRAY['Go', 'PostgreSQL'], ARRAY['Go', 'PostgreSQL', 'Redis'], 2200000, 3800000, 'full-time'),
('SDE Intern', 'Microsoft', 'Bangalore', 'Summer internship', ARRAY['Currently studying'], ARRAY['DSA', 'C++', 'Python'], 100000, 150000, 'internship'),
('ML Engineer', 'Uber', 'Bangalore', 'Machine learning', ARRAY['ML', 'Python'], ARRAY['Python', 'ML', 'Spark'], 3000000, 5500000, 'full-time');

INSERT INTO public.courses (title, provider, url, skills, duration, level, rating) VALUES
('DSA for Placements', 'Apna College', 'https://youtube.com', ARRAY['DSA', 'Algorithms'], '25 hours', 'beginner', 4.8),
('Full Stack Web Development', 'CodeWithHarry', 'https://youtube.com', ARRAY['HTML', 'CSS', 'JavaScript'], '40 hours', 'beginner', 4.7),
('Python Tutorial', 'Telusko', 'https://youtube.com', ARRAY['Python', 'Django'], '15 hours', 'beginner', 4.6),
('React JS Tutorial', 'Thapa Technical', 'https://youtube.com', ARRAY['React', 'Redux'], '20 hours', 'intermediate', 4.8),
('System Design', 'Gaurav Sen', 'https://youtube.com', ARRAY['System Design'], '12 hours', 'advanced', 4.9);

INSERT INTO public.candidates (name, email, role, skills, status) VALUES
('Rahul Sharma', 'rahul@demo.com', 'SDE', '[{"name": "Python", "score": 90}]', 'new'),
('Priya Patel', 'priya@demo.com', 'Frontend', '[{"name": "React", "score": 92}]', 'screening'),
('Amit Kumar', 'amit@demo.com', 'Backend', '[{"name": "Java", "score": 88}]', 'interview');

SELECT 'Database setup complete with Supabase Auth!';
