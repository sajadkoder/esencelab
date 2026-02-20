-- Run this in Supabase SQL Editor after schema is created

-- Insert demo users (password is 'demo123' hashed with bcrypt)
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO "users" (id, email, password_hash, name, role) VALUES
('user-student-1', 'student@esencelab.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John Student', 'student'),
('user-recruiter-1', 'recruiter@esencelab.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane Recruiter', 'recruiter'),
('user-admin-1', 'admin@esencelab.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- Insert demo jobs
INSERT INTO "jobs" (id, title, company, description, requirements, location, salary_min, salary_max, job_type, status, recruiter_id) VALUES
('job-1', 'Software Engineer', 'Tech Corp', 'We are looking for a skilled software engineer to join our team.', 'Python, JavaScript, React, Node.js, SQL', 'New York, NY', 80000, 120000, 'full_time', 'active', 'user-recruiter-1'),
('job-2', 'Data Scientist', 'Data Inc', 'Join our data science team to build ML models.', 'Python, Machine Learning, TensorFlow, SQL, Statistics', 'San Francisco, CA', 100000, 150000, 'full_time', 'active', 'user-recruiter-1'),
('job-3', 'Frontend Developer', 'Web Solutions', 'Build beautiful web applications.', 'React, TypeScript, CSS, HTML, JavaScript', 'Remote', 60000, 90000, 'full_time', 'active', 'user-recruiter-1'),
('job-4', 'Backend Developer', 'API Solutions', 'Build scalable backend services.', 'Node.js, Python, PostgreSQL, REST APIs, Docker', 'Austin, TX', 70000, 110000, 'full_time', 'active', 'user-recruiter-1'),
('job-5', 'DevOps Engineer', 'Cloud Systems', 'Manage cloud infrastructure.', 'AWS, Docker, Kubernetes, CI/CD, Terraform', 'Seattle, WA', 90000, 140000, 'full_time', 'active', 'user-recruiter-1')
ON CONFLICT DO NOTHING;

-- Insert demo courses
INSERT INTO "courses" (id, title, description, instructor, url) VALUES
('course-1', 'Complete Python Bootcamp', 'Learn Python from scratch to advanced concepts.', 'Dr. Angela Yu', 'https://www.udemy.com/course/complete-python-bootcamp/'),
('course-2', 'React - The Complete Guide', 'Master React.js including hooks, Redux, and more.', 'Maximilian Schwarzmuller', 'https://www.udemy.com/course/react-the-complete-guide/'),
('course-3', 'Machine Learning A-Z', 'Learn to create Machine Learning Algorithms.', 'Kirill Eremenko', 'https://www.udemy.com/course/machinelearning/'),
('course-4', 'Node.js Developer Course', 'Learn Node.js by building real-world applications.', 'Andrew Mead', 'https://www.udemy.com/course/node-js-developer-course/')
ON CONFLICT DO NOTHING;
