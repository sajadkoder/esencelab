-- Esencelab Database Setup - Standalone Version
-- Run this in your Supabase SQL Editor (no Supabase Auth required)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.user_credentials CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS candidate_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS course_level CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'hired', 'rejected');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Users/Profiles table (standalone - no auth.users dependency)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User credentials table
CREATE TABLE public.user_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
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

-- Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials DISABLE ROW LEVEL SECURITY;

-- Insert demo users
INSERT INTO public.profiles (id, email, name, role) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'student@demo.com', 'Demo Student', 'student'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'employer@demo.com', 'Demo Employer', 'employer'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'admin@demo.com', 'Demo Admin', 'admin');

-- Insert credentials (password: demo123)
INSERT INTO public.user_credentials (user_id, password_hash) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '$2a$10$YOEI6S6gHaJw.LeWnIhbrO2IzF/3l/fQH7zTQCU.oMLhaddT./cMy'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '$2a$10$YOEI6S6gHaJw.LeWnIhbrO2IzF/3l/fQH7zTQCU.oMLhaddT./cMy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '$2a$10$YOEI6S6gHaJw.LeWnIhbrO2IzF/3l/fQH7zTQCU.oMLhaddT./cMy');

-- Insert Indian jobs
INSERT INTO public.jobs (employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'SDE I', 'Google India', 'Bangalore/Hyderabad', 'Software Development Engineer', ARRAY['B.Tech/M.Tech', 'DSA', 'Problem Solving'], ARRAY['Python', 'Java', 'DSA', 'System Design'], 2500000, 4500000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Software Engineer', 'Amazon', 'Bangalore', 'Full stack development', ARRAY['B.Tech', 'Coding skills', 'CS fundamentals'], ARRAY['Java', 'DSA', 'AWS', 'React'], 2000000, 4000000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Frontend Developer', 'Flipkart', 'Bangalore', 'E-commerce platform development', ARRAY['React', 'TypeScript', 'CSS'], ARRAY['React', 'TypeScript', 'CSS', 'Redux'], 1500000, 2800000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Backend Developer', 'Cred', 'Bangalore', 'Financial technology', ARRAY['Go', 'PostgreSQL', 'Redis'], ARRAY['Go', 'PostgreSQL', 'Redis', 'MongoDB'], 2200000, 3800000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Data Analyst', 'Droom', 'Gurgaon', 'Data analysis and insights', ARRAY['Python', 'SQL', 'Tableau'], ARRAY['Python', 'SQL', 'Tableau', 'Excel'], 800000, 1800000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'SDE Intern', 'Microsoft', 'Bangalore/Hyderabad', 'Summer internship', ARRAY['Currently studying', 'Programming basics'], ARRAY['DSA', 'C++', 'Python'], 100000, 150000, 'internship'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ML Engineer', 'Uber', 'Bangalore', 'Machine learning solutions', ARRAY['ML', 'Python', 'Spark'], ARRAY['Python', 'ML', 'Spark', 'TensorFlow'], 3000000, 5500000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Full Stack Developer', 'Paytm', 'Noida', 'Digital payments', ARRAY['Node.js', 'React', 'MongoDB'], ARRAY['React', 'Node.js', 'MongoDB', 'AWS'], 1200000, 2500000, 'full-time'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Software Engineer Intern', 'TechCorp', 'San Francisco, CA', 'Build scalable web applications', ARRAY['Currently enrolled', 'Python or JavaScript'], ARRAY['Python', 'JavaScript', 'React', 'Git'], 3000000, 4000000, 'internship'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Data Analyst', 'DataFlow', 'New York, NY', 'Analyze large datasets', ARRAY['BS in Statistics', 'SQL proficiency'], ARRAY['SQL', 'Python', 'Pandas', 'Tableau'], 7000000, 9000000, 'full-time');

-- Insert courses
INSERT INTO public.courses (title, provider, url, skills, duration, level, rating) VALUES
('DSA for Placements', 'Apna College', 'https://youtube.com/playlist?list=PLh5p_2jK9jT3wBZ8c7v7vq7w8', ARRAY['DSA', 'Algorithms', 'C++'], '25 hours', 'beginner', 4.8),
('Full Stack Web Development', 'CodeWithHarry', 'https://youtube.com/playlist?list=PLu0W_9lI9ah7eT1Ea3D1T', ARRAY['HTML', 'CSS', 'JavaScript', 'Node.js'], '40 hours', 'beginner', 4.7),
('Python Tutorial', 'Telusko', 'https://youtube.com/playlist?list=PLl_O5n3C3x0o4pL', ARRAY['Python', 'Django', 'Flask'], '15 hours', 'beginner', 4.6),
('React JS Tutorial', 'Thapa Technical', 'https://youtube.com/playlist?list=PLl_Hm2', ARRAY['React', 'Redux', 'Hooks'], '20 hours', 'intermediate', 4.8),
('Machine Learning', 'Krish Naik', 'https://youtube.com/playlist?list=PLzEwt', ARRAY['ML', 'Python', 'TensorFlow'], '30 hours', 'intermediate', 4.7),
('System Design', 'Gaurav Sen', 'https://youtube.com/playlist?list=PLMCXHdwGn6H_', ARRAY['System Design', 'Architecture'], '12 hours', 'advanced', 4.9),
('C++ DSA Course', 'Love Babbar', 'https://youtube.com/playlist?list=PLKNf', ARRAY['C++', 'DSA', 'Algorithms'], '35 hours', 'beginner', 4.8),
('DSA Self Paced', 'GeeksforGeeks', 'https://practice.geeksforgeeks.org/courses', ARRAY['DSA', 'Algorithms'], 'Self Paced', 'beginner', 4.6),
('Full Stack Development', 'Scaler Academy', 'https://www.scaler.com/full-stack/', ARRAY['React', 'Node.js', 'System Design'], '6 months', 'intermediate', 4.7),
('DSA & System Design', 'Coding Ninjas', 'https://www.codingninjas.com/', ARRAY['DSA', 'System Design'], '4 months', 'intermediate', 4.6);

-- Insert Indian candidates
INSERT INTO public.candidates (name, email, role, skills, education, experience, match_score, status) VALUES
('Rahul Sharma', 'rahul@iitb.ac.in', 'SDE', '[{"name": "Python", "score": 90}, {"name": "DSA", "score": 85}, {"name": "ML", "score": 80}]', '[{"institution": "IIT Bombay", "degree": "B.Tech", "field": "Computer Science"}]', '[{"company": "Microsoft", "title": "SDE Intern"}]', 94, 'new'),
('Priya Patel', 'priya@nitt.edu', 'Frontend Developer', '[{"name": "React", "score": 92}, {"name": "TypeScript", "score": 88}, {"name": "CSS", "score": 90}]', '[{"institution": "NIT Trichy", "degree": "B.Tech", "field": "IT"}]', '[{"company": "Flipkart", "title": "Frontend Intern"}]', 89, 'screening'),
('Amit Kumar', 'amit@iiitb.ac.in', 'Backend Developer', '[{"name": "Java", "score": 88}, {"name": "Spring", "score": 85}, {"name": "PostgreSQL", "score": 82}]', '[{"institution": "IIIT Bangalore", "degree": "M.Tech", "field": "Computer Science"}]', '[{"company": "Amazon", "title": "SDE Intern"}]', 91, 'interview'),
('Sneha Reddy', 'sneha@iitd.ac.in', 'Data Analyst', '[{"name": "Python", "score": 90}, {"name": "SQL", "score": 88}, {"name": "Tableau", "score": 85}]', '[{"institution": "IIT Delhi", "degree": "B.Tech", "field": "Data Science"}]', '[{"company": "Droom", "title": "Data Intern"}]', 87, 'new'),
('Vikram Singh', 'vikram@bits-pilani.ac.in', 'Full Stack Developer', '[{"name": "Node.js", "score": 88}, {"name": "React", "score": 85}, {"name": "MongoDB", "score": 82}]', '[{"institution": "BITS Pilani", "degree": "B.E", "field": "Computer Science"}]', '[{"company": "Paytm", "title": "Full Stack Developer"}]', 92, 'hired');

SELECT 'Database setup complete! You can now login with:' as message;
SELECT 'Student: student@demo.com / demo123' as student;
SELECT 'Employer: employer@demo.com / demo123' as employer;
SELECT 'Admin: admin@demo.com / demo123' as admin;
