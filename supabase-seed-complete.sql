-- Comprehensive Seed Data for Esencelab
-- Run this in Supabase SQL Editor after schema

-- Insert Demo Users (Password: demo123)
-- Using bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO profiles (id, email, name, role) VALUES
('prof-student-1', 'student@esencelab.com', 'John Student', 'student'),
('prof-student-2', 'student2@esencelab.com', 'Sarah Johnson', 'student'),
('prof-student-3', 'student3@esencelab.com', 'Mike Chen', 'student'),
('prof-employer-1', 'recruiter@esencelab.com', 'Jane Recruiter', 'employer'),
('prof-employer-2', 'employer@esencelab.com', 'Tech HR', 'employer'),
('prof-admin-1', 'admin@esencelab.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Candidates with parsed resume data
INSERT INTO candidates (id, user_id, name, email, role, skills, education, experience, match_score, status) VALUES
('cand-1', 'prof-student-1', 'John Student', 'student@esencelab.com', 'Software Developer',
  '["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Computer Science", "year": "2025"}]'::jsonb,
  '[{"company": "Tech Intern", "title": "Intern", "duration": "6 months"}]'::jsonb,
  85, 'new'),

('cand-2', 'prof-student-2', 'Sarah Johnson', 'student2@esencelab.com', 'Data Scientist',
  '["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "Pandas"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Data Science", "year": "2024"}]'::jsonb,
  '[{"company": "DataCorp", "title": "Data Analyst", "duration": "1 year"}]'::jsonb,
  90, 'new'),

('cand-3', 'prof-student-3', 'Mike Chen', 'student3@esencelab.com', 'Frontend Developer',
  '["React", "TypeScript", "CSS", "HTML", "JavaScript", "Tailwind"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Information Technology", "year": "2025"}]'::jsonb,
  '[]'::jsonb,
  75, 'new');

-- Insert Jobs
INSERT INTO jobs (id, employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type, status) VALUES
('job-1', 'prof-employer-1', 'Software Engineer', 'Tech Corp', 'New York, NY',
  'We are looking for a skilled software engineer to join our team.',
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
  80000, 120000, 'full-time', 'active'),

('job-2', 'prof-employer-1', 'Data Scientist', 'Data Inc', 'San Francisco, CA',
  'Join our data science team to build ML models.',
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Pandas'],
  100000, 150000, 'full-time', 'active'),

('job-3', 'prof-employer-1', 'Frontend Developer', 'Web Solutions', 'Remote',
  'Build beautiful web applications.',
  ARRAY['React', 'TypeScript', 'CSS', 'HTML'],
  ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Tailwind'],
  60000, 90000, 'full-time', 'active'),

('job-4', 'prof-employer-1', 'Backend Developer', 'API Solutions', 'Austin, TX',
  'Build scalable backend services.',
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
  70000, 110000, 'full-time', 'active'),

('job-5', 'prof-employer-1', 'DevOps Engineer', 'Cloud Systems', 'Seattle, WA',
  'Manage cloud infrastructure.',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  90000, 140000, 'full-time', 'active'),

('job-6', 'prof-employer-2', 'Full Stack Developer', 'StartupXYZ', 'Bangalore, India',
  'Join our fast-growing startup as a full stack developer.',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express'],
  ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'Git'],
  60000, 100000, 'full-time', 'active'),

('job-7', 'prof-employer-2', 'ML Engineer', 'AI Labs', 'Hyderabad, India',
  'Work on cutting-edge AI and ML projects.',
  ARRAY['Python', 'PyTorch', 'Deep Learning', 'NLP'],
  ARRAY['Python', 'PyTorch', 'Deep Learning', 'NLP', 'TensorFlow', 'Computer Vision'],
  80000, 130000, 'full-time', 'active'),

('job-8', 'prof-employer-1', 'Intern - Software Development', 'Tech Corp', 'Remote',
  'Summer internship for CS students.',
  ARRAY['Python', 'Java', 'C++'],
  ARRAY['Python', 'Java', 'C++', 'Data Structures'],
  30000, 40000, 'internship', 'active');

-- Insert Applications
INSERT INTO applications (job_id, candidate_id, status) VALUES
('job-1', 'cand-1', 'pending'),
('job-2', 'cand-2', 'pending'),
('job-3', 'cand-3', 'pending'),
('job-6', 'cand-1', 'reviewed');

-- Insert Courses
INSERT INTO courses (id, title, description, provider, url, skills, duration, level, rating) VALUES
('course-1', 'Complete Python Bootcamp', 'Learn Python from scratch to advanced concepts including Django and Flask.', 'Udemy', 'https://www.udemy.com/course/complete-python-bootcamp/', ARRAY['Python', 'Django', 'Flask'], '22 hours', 'beginner', 4.5),
('course-2', 'React - The Complete Guide', 'Master React.js including hooks, Redux, React Router, and Next.js.', 'Udemy', 'https://www.udemy.com/course/react-the-complete-guide/', ARRAY['React', 'Redux', 'JavaScript'], '40 hours', 'intermediate', 4.6),
('course-3', 'Machine Learning A-Z', 'Learn to create Machine Learning Algorithms in Python and R.', 'Udemy', 'https://www.udemy.com/course/machinelearning/', ARRAY['Python', 'Machine Learning', 'TensorFlow'], '44 hours', 'intermediate', 4.5),
('course-4', 'Node.js Developer Course', 'Learn Node.js by building real-world applications with Express, MongoDB.', 'Udemy', 'https://www.udemy.com/course/node-js-developer-course/', ARRAY['Node.js', 'Express', 'MongoDB'], '37 hours', 'intermediate', 4.7),
('course-5', 'JavaScript Fundamentals', 'Master JavaScript from the basics to advanced concepts.', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', ARRAY['JavaScript', 'ES6'], '20 hours', 'beginner', 4.8),
('course-6', 'AWS Solutions Architect', 'Prepare for AWS certification and learn cloud computing.', 'Coursera', 'https://www.coursera.org/professional-certificates/aws-cloud-practitioner', ARRAY['AWS', 'Cloud'], '30 hours', 'advanced', 4.6),
('course-7', 'Data Structures and Algorithms', 'Master DSA for coding interviews.', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/data-structures/', ARRAY['Data Structures', 'Algorithms'], '15 hours', 'intermediate', 4.4),
('course-8', 'SQL Bootcamp', 'Learn SQL from zero to hero.', 'Udemy', 'https://www.udemy.com/course/the-complete-sql-bootcamp/', ARRAY['SQL', 'PostgreSQL', 'MySQL'], '12 hours', 'beginner', 4.7),
('course-9', 'Docker & Kubernetes Mastery', 'Containerization and orchestration explained.', 'Udemy', 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', ARRAY['Docker', 'Kubernetes'], '26 hours', 'advanced', 4.8),
('course-10', 'TypeScript Mastery', 'TypeScript for modern JavaScript development.', 'Udemy', 'https://www.udemy.com/course/typescript-masterclass/', ARRAY['TypeScript', 'JavaScript'], '18 hours', 'intermediate', 4.5);

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, action, details, metadata) VALUES
('prof-student-1', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "cand-1"}'::jsonb),
('prof-student-2', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "cand-2"}'::jsonb),
('prof-student-3', 'resume_uploaded', 'Student uploaded resume', '{"resume_id": "cand-3"}'::jsonb),
('prof-student-1', 'job_applied', 'Applied to Software Engineer', '{"job_id": "job-1"}'::jsonb),
('prof-student-2', 'job_applied', 'Applied to Data Scientist', '{"job_id": "job-2"}'::jsonb),
('prof-student-3', 'job_applied', 'Applied to Frontend Developer', '{"job_id": "job-3"}'::jsonb),
('prof-employer-1', 'job_posted', 'Posted new job', '{"job_id": "job-1"}'::jsonb),
('prof-employer-1', 'job_posted', 'Posted new job', '{"job_id": "job-2"}'::jsonb);
