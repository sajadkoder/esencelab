-- Insert Demo Users with proper UUIDs (Password: demo123)
INSERT INTO profiles (id, email, name, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'student@esencelab.com', 'Sajad', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'recruiter@esencelab.com', 'Rajesh Kumar', 'employer'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'admin@esencelab.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Candidates with parsed resume data
INSERT INTO candidates (id, user_id, name, email, role, skills, education, experience, match_score, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sajad', 'student@esencelab.com', 'Software Developer',
  '["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]'::jsonb,
  '[{"institution": "SNGCET", "degree": "B.Tech", "field": "Computer Science", "year": "2025"}]'::jsonb,
  '[{"company": "Tech Intern", "title": "Intern", "duration": "6 months"}]'::jsonb,
  85, 'new');

-- Insert Jobs
INSERT INTO jobs (id, employer_id, title, company, location, description, requirements, skills, salary_min, salary_max, job_type, status) VALUES
('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Software Engineer', 'Tech Corp', 'Bangalore, India',
  'We are looking for a skilled software engineer to join our team.',
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
  ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
  80000, 120000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Data Scientist', 'Data Inc', 'Hyderabad, India',
  'Join our data science team to build ML models.',
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Pandas'],
  100000, 150000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Frontend Developer', 'Web Solutions', 'Remote',
  'Build beautiful web applications.',
  ARRAY['React', 'TypeScript', 'CSS', 'HTML'],
  ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Tailwind'],
  60000, 90000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Backend Developer', 'API Solutions', 'Chennai, India',
  'Build scalable backend services.',
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
  ARRAY['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
  70000, 110000, 'full-time', 'active'),

('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'DevOps Engineer', 'Cloud Systems', 'Bangalore, India',
  'Manage cloud infrastructure.',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  90000, 140000, 'full-time', 'active');

-- Insert Courses
INSERT INTO courses (id, title, description, provider, url, skills, duration, level, rating) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'Complete Python Bootcamp', 'Learn Python from scratch to advanced concepts.', 'Udemy', 'https://www.udemy.com/course/complete-python-bootcamp/', ARRAY['Python', 'Django', 'Flask'], '22 hours', 'beginner', 4.5),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'React - The Complete Guide', 'Master React.js including hooks, Redux, and more.', 'Udemy', 'https://www.udemy.com/course/react-the-complete-guide/', ARRAY['React', 'Redux', 'JavaScript'], '40 hours', 'intermediate', 4.6),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'Machine Learning A-Z', 'Learn to create Machine Learning Algorithms.', 'Udemy', 'https://www.udemy.com/course/machinelearning/', ARRAY['Python', 'Machine Learning', 'TensorFlow'], '44 hours', 'intermediate', 4.5),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Node.js Developer Course', 'Learn Node.js by building real-world applications.', 'Udemy', 'https://www.udemy.com/course/node-js-developer-course/', ARRAY['Node.js', 'Express', 'MongoDB'], '37 hours', 'intermediate', 4.7);
