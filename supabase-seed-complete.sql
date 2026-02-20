-- Comprehensive Seed Data for Esencelab
-- Run this in Supabase SQL Editor after schema

-- Insert Demo Users with proper UUIDs (Password: demo123)
INSERT INTO profiles (id, email, name, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'student@esencelab.com', 'Sajad', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'student2@esencelab.com', 'Harikrishnan', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'student3@esencelab.com', 'Jishnu', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'student4@esencelab.com', 'Adwatath', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'recruiter@esencelab.com', 'Rajesh Kumar', 'employer'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'employer@esencelab.com', 'Prakash S', 'employer'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'admin@esencelab.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Candidates with parsed resume data
INSERT INTO candidates (id, user_id, name, email, role, skills, education, experience, match_score, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sajad', 'student@esencelab.com', 'Software Developer',
  '["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Computer Science", "year": "2025"}]'::jsonb,
  '[{"company": "Tech Intern", "title": "Intern", "duration": "6 months"}]'::jsonb,
  85, 'new'),

('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Harikrishnan', 'student2@esencelab.com', 'Data Scientist',
  '["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "Pandas"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Data Science", "year": "2024"}]'::jsonb,
  '[{"company": "DataCorp", "title": "Data Analyst", "duration": "1 year"}]'::jsonb,
  90, 'new'),

('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Jishnu', 'student3@esencelab.com', 'Frontend Developer',
  '["React", "TypeScript", "CSS", "HTML", "JavaScript", "Tailwind"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Information Technology", "year": "2025"}]'::jsonb,
  '[]'::jsonb,
  75, 'new'),

('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Adwatath', 'student4@esencelab.com', 'Full Stack Developer',
  '["React", "Node.js", "MongoDB", "Express", "Python", "JavaScript"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Computer Engineering", "year": "2024"}]'::jsonb,
  '[{"company": "StartupXYZ", "title": "Full Stack Intern", "duration": "3 months"}]'::jsonb,
  80, 'new');

-- Insert Jobs
INSERT INTO jobs (id, employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type, status) VALUES
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Software Engineer', 'Tech Corp', 'Bangalore, India',
  'We are looking for a skilled software engineer to join our team.',
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
  80000, 120000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Data Scientist', 'Data Inc', 'Hyderabad, India',
  'Join our data science team to build ML models.',
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Pandas'],
  100000, 150000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Frontend Developer', 'Web Solutions', 'Remote',
  'Build beautiful web applications.',
  ARRAY['React', 'TypeScript', 'CSS', 'HTML'],
  ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Tailwind'],
  60000, 90000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Backend Developer', 'API Solutions', 'Chennai, India',
  'Build scalable backend services.',
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
  70000, 110000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'DevOps Engineer', 'Cloud Systems', 'Bangalore, India',
  'Manage cloud infrastructure.',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  90000, 140000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Full Stack Developer', 'StartupXYZ', 'Kochi, India',
  'Join our fast-growing startup as a full stack developer.',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express'],
  ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'Git'],
  60000, 100000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'ML Engineer', 'AI Labs', 'Hyderabad, India',
  'Work on cutting-edge AI and ML projects.',
  ARRAY['Python', 'PyTorch', 'Deep Learning', 'NLP'],
  ARRAY['Python', 'PyTorch', 'Deep Learning', 'NLP', 'TensorFlow', 'Computer Vision'],
  80000, 130000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Intern - Software Development', 'Tech Corp', 'Bangalore, India',
  'Summer internship for CS students.',
  ARRAY['Python', 'Java', 'C++'],
  ARRAY['Python', 'Java', 'C++', 'Data Structures'],
  30000, 40000, 'internship', 'active');

-- Insert Applications
INSERT INTO applications (job_id, candidate_id, status) VALUES
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'pending'),
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'pending'),
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'pending'),
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'reviewed');

-- Insert Courses
INSERT INTO courses (id, title, description, provider, url, skills, duration, level, rating) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Complete Python Bootcamp', 'Learn Python from scratch to advanced concepts including Django and Flask.', 'Udemy', 'https://www.udemy.com/course/complete-python-bootcamp/', ARRAY['Python', 'Django', 'Flask'], '22 hours', 'beginner', 4.5),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'React - The Complete Guide', 'Master React.js including hooks, Redux, React Router, and Next.js.', 'Udemy', 'https://www.udemy.com/course/react-the-complete-guide/', ARRAY['React', 'Redux', 'JavaScript'], '40 hours', 'intermediate', 4.6),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'Machine Learning A-Z', 'Learn to create Machine Learning Algorithms in Python and R.', 'Udemy', 'https://www.udemy.com/course/machinelearning/', ARRAY['Python', 'Machine Learning', 'TensorFlow'], '44 hours', 'intermediate', 4.5),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Node.js Developer Course', 'Learn Node.js by building real-world applications with Express, MongoDB.', 'Udemy', 'https://www.udemy.com/course/node-js-developer-course/', ARRAY['Node.js', 'Express', 'MongoDB'], '37 hours', 'intermediate', 4.7),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'JavaScript Fundamentals', 'Master JavaScript from the basics to advanced concepts.', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', ARRAY['JavaScript', 'ES6'], '20 hours', 'beginner', 4.8),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'AWS Solutions Architect', 'Prepare for AWS certification and learn cloud computing.', 'Coursera', 'https://www.coursera.org/professional-certificates/aws-cloud-practitioner', ARRAY['AWS', 'Cloud'], '30 hours', 'advanced', 4.6),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'Data Structures and Algorithms', 'Master DSA for coding interviews.', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/data-structures/', ARRAY['Data Structures', 'Algorithms'], '15 hours', 'intermediate', 4.4),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', 'SQL Bootcamp', 'Learn SQL from zero to hero.', 'Udemy', 'https://www.udemy.com/course/the-complete-sql-bootcamp/', ARRAY['SQL', 'PostgreSQL', 'MySQL'], '12 hours', 'beginner', 4.7),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a49', 'Docker & Kubernetes Mastery', 'Containerization and orchestration explained.', 'Udemy', 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', ARRAY['Docker', 'Kubernetes'], '26 hours', 'advanced', 4.8),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a4a', 'TypeScript Mastery', 'TypeScript for modern JavaScript development.', 'Udemy', 'https://www.udemy.com/course/typescript-masterclass/', ARRAY['TypeScript', 'JavaScript'], '18 hours', 'intermediate', 4.5);

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, action, details, metadata) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'job_applied', 'Applied to Software Engineer', '{"job_id": "j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'job_applied', 'Applied to Data Scientist', '{"job_id": "j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'job_applied', 'Applied to Frontend Developer', '{"job_id": "j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'job_posted', 'Posted new job', '{"job_id": "j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31"}'::jsonb),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'job_posted', 'Posted new job', '{"job_id": "j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32"}'::jsonb);
