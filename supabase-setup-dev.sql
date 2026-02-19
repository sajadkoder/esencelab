-- Esencelab Database Setup - Development Version
-- Run this in your Supabase SQL Editor to allow development without RLS issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.user_credentials CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS candidate_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS course_level CASCADE;

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

-- Disable RLS for development (enable in production with proper policies!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials DISABLE ROW LEVEL SECURITY;

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

-- Create a demo user for testing
INSERT INTO public.profiles (id, email, name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@esencelab.com', 'Demo Student', 'student');

-- Add demo user credentials (password: demo123)
INSERT INTO public.user_credentials (user_id, password_hash) VALUES 
('00000000-0000-0000-0000-000000000001', '$2a$10$rXnVkYzJQJ8KxP5QvNqvXeY1FHR5G5mH.5vKzNxGxHGPwJ7Xw.Y6');

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

-- Insert Indian jobs
INSERT INTO public.jobs (employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type) VALUES
(NULL, 'SDE I', 'Google India', 'Bangalore/Hyderabad', 'Software Development Engineer', ARRAY['B.Tech/M.Tech', 'DSA', 'Problem Solving'], ARRAY['Python', 'Java', 'DSA', 'System Design'], 25, 45, 'full-time'),
(NULL, 'Software Engineer', 'Amazon', 'Bangalore', 'Full stack development', ARRAY['B.Tech', 'Coding skills', 'CS fundamentals'], ARRAY['Java', 'DSA', 'AWS', 'React'], 20, 40, 'full-time'),
(NULL, 'Frontend Developer', 'Flipkart', 'Bangalore', 'E-commerce platform development', ARRAY['React', 'TypeScript', 'CSS'], ARRAY['React', 'TypeScript', 'CSS', 'Redux'], 15, 28, 'full-time'),
(NULL, 'Backend Developer', 'Cred', 'Bangalore', 'Financial technology', ARRAY['Go', 'PostgreSQL', 'Redis'], ARRAY['Go', 'PostgreSQL', 'Redis', 'MongoDB'], 22, 38, 'full-time'),
(NULL, 'Data Analyst', 'Droom', 'Gurgaon', 'Data analysis and insights', ARRAY['Python', 'SQL', 'Tableau'], ARRAY['Python', 'SQL', 'Tableau', 'Excel'], 8, 18, 'full-time'),
(NULL, 'SDE Intern', 'Microsoft', 'Bangalore/Hyderabad', 'Summer internship', ARRAY['Currently studying', 'Programming basics'], ARRAY['DSA', 'C++', 'Python'], 100000, 150000, 'internship'),
(NULL, 'ML Engineer', 'Uber', 'Bangalore', 'Machine learning solutions', ARRAY['ML', 'Python', 'Spark'], ARRAY['Python', 'ML', 'Spark', 'TensorFlow'], 30, 55, 'full-time'),
(NULL, 'Full Stack Developer', 'Paytm', 'Noida', 'Digital payments', ARRAY['Node.js', 'React', 'MongoDB'], ARRAY['React', 'Node.js', 'MongoDB', 'AWS'], 12, 25, 'full-time');

-- Insert courses for Indian students
INSERT INTO public.courses (title, provider, url, skills, duration, level, rating) VALUES
('DSA for Placements', 'Apna College', 'https://youtube.com/playlist?list=PLh5p_2jK9jT3wBZ8c7v7vq7w8', ARRAY['DSA', 'Algorithms', 'C++'], '25 hours', 'beginner', 4.8),
('Full Stack Web Development', 'CodeWithHarry', 'https://youtube.com/playlist?list=PLu0W_9lI9ah7eT1Ea3D1T', ARRAY['HTML', 'CSS', 'JavaScript', 'Node.js'], '40 hours', 'beginner', 4.7),
('Python Tutorial', 'Telusko', 'https://youtube.com/playlist?list=PLl_O5n3C3x0o4pL', ARRAY['Python', 'Django', 'Flask'], '15 hours', 'beginner', 4.6),
('React JS Tutorial', 'Thapa Technical', 'https://youtube.com/playlist?list=PLl_Hm2', ARRAY['React', 'Redux', 'Hooks'], '20 hours', 'intermediate', 4.8),
('Machine Learning', 'Krish Naik', 'https://youtube.com/playlist?list=PLzEwt', ARRAY['ML', 'Python', 'TensorFlow'], '30 hours', 'intermediate', 4.7),
('SQL & Database', 'TechTFQ', 'https://youtube.com/playlist?list=PLbtx', ARRAY['SQL', 'PostgreSQL', 'MongoDB'], '8 hours', 'beginner', 4.5),
('System Design', 'Gaurav Sen', 'https://youtube.com/playlist?list=PLMCXHdwGn6H_', ARRAY['System Design', 'Architecture'], '12 hours', 'advanced', 4.9),
('C++ DSA Course', 'Love Babbar', 'https://youtube.com/playlist?list=PLKNf', ARRAY['C++', 'DSA', 'Algorithms'], '35 hours', 'beginner', 4.8),
('DSA Self Paced', 'GeeksforGeeks', 'https://practice.geeksforgeeks.org/courses', ARRAY['DSA', 'Algorithms'], 'Self Paced', 'beginner', 4.6),
('Full Stack Development', 'Scaler Academy', 'https://www.scaler.com/full-stack/', ARRAY['React', 'Node.js', 'System Design'], '6 months', 'intermediate', 4.7),
('Data Science Masters', 'Newton School', 'https://www.newtonschool.co/', ARRAY['Python', 'ML', 'Data Science'], '6 months', 'intermediate', 4.5),
('DSA & System Design', 'Coding Ninjas', 'https://www.codingninjas.com/', ARRAY['DSA', 'System Design'], '4 months', 'intermediate', 4.6),
('Interview Preparation', 'Preplaced', 'https://preplaced.io/', ARRAY['DSA', 'Aptitude'], 'Self Paced', 'beginner', 4.4);

-- Insert Indian candidates
INSERT INTO public.candidates (name, email, role, skills, education, experience, match_score, status) VALUES
('Rahul Sharma', 'rahul@iitb.ac.in', 'SDE', '[{"name": "Python", "score": 90, "category": "technical"}, {"name": "DSA", "score": 85, "category": "technical"}, {"name": "ML", "score": 80, "category": "domain"}]', '[{"institution": "IIT Bombay", "degree": "B.Tech", "field": "Computer Science", "startDate": "2021", "endDate": "2025"}]', '[{"company": "Microsoft", "title": "SDE Intern", "description": "Cloud development", "startDate": "2024", "endDate": "2024"}]', 94, 'new'),
('Priya Patel', 'priya@nitt.edu', 'Frontend Developer', '[{"name": "React", "score": 92, "category": "technical"}, {"name": "TypeScript", "score": 88, "category": "technical"}, {"name": "CSS", "score": 90, "category": "technical"}]', '[{"institution": "NIT Trichy", "degree": "B.Tech", "field": "IT", "startDate": "2020", "endDate": "2024"}]', '[{"company": "Flipkart", "title": "Frontend Intern", "description": "UI development", "startDate": "2023", "endDate": "2023"}]', 89, 'screening'),
('Amit Kumar', 'amit@iiitb.ac.in', 'Backend Developer', '[{"name": "Java", "score": 88, "category": "technical"}, {"name": "Spring", "score": 85, "category": "technical"}, {"name": "PostgreSQL", "score": 82, "category": "technical"}]', '[{"institution": "IIIT Bangalore", "degree": "M.Tech", "field": "Computer Science", "startDate": "2022", "endDate": "2024"}]', '[{"company": "Amazon", "title": "SDE Intern", "description": "Backend services", "startDate": "2023", "endDate": "2023"}]', 91, 'interview'),
('Sneha Reddy', 'sneha@iitd.ac.in', 'Data Analyst', '[{"name": "Python", "score": 90, "category": "technical"}, {"name": "SQL", "score": 88, "category": "technical"}, {"name": "Tableau", "score": 85, "category": "technical"}]', '[{"institution": "IIT Delhi", "degree": "B.Tech", "field": "Data Science", "startDate": "2021", "endDate": "2025"}]', '[{"company": "Droom", "title": "Data Intern", "description": "Data analysis", "startDate": "2024", "endDate": "2024"}]', 87, 'new'),
('Vikram Singh', 'vikram@bits-pilani.ac.in', 'Full Stack Developer', '[{"name": "Node.js", "score": 88, "category": "technical"}, {"name": "React", "score": 85, "category": "technical"}, {"name": "MongoDB", "score": 82, "category": "technical"}]', '[{"institution": "BITS Pilani", "degree": "B.E", "field": "Computer Science", "startDate": "2019", "endDate": "2023"}]', '[{"company": "Paytm", "title": "Full Stack Developer", "description": "Payment gateway", "startDate": "2023", "endDate": "Present"}]', 92, 'hired');

SELECT 'Database setup complete!' as status;
