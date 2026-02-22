-- EsenceLab Supabase Seed Data (SQL Editor)
-- Password for demo users: demo123

-- Demo user IDs
-- student: 11111111-1111-1111-1111-111111111111
-- employer: 22222222-2222-2222-2222-222222222222
-- admin: 33333333-3333-3333-3333-333333333333

INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'student@esencelab.com', '$2b$10$pJ0mHQGWmwXfDWLrVHUeQext.Do/SHJwYBfrUxTw15Kb7/Bkjp.z.', 'Sajad', 'student', true),
  ('22222222-2222-2222-2222-222222222222', 'recruiter@esencelab.com', '$2b$10$pJ0mHQGWmwXfDWLrVHUeQext.Do/SHJwYBfrUxTw15Kb7/Bkjp.z.', 'adwaith', 'employer', true),
  ('33333333-3333-3333-3333-333333333333', 'admin@esencelab.com', '$2b$10$pJ0mHQGWmwXfDWLrVHUeQext.Do/SHJwYBfrUxTw15Kb7/Bkjp.z.', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

INSERT INTO candidates (id, user_id, name, email, role, skills, education, experience, match_score, status)
VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Sajad',
    'student@esencelab.com',
    'Software Developer',
    '["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]'::jsonb,
    '[{"institution":"SNGCET","degree":"B.Tech","field":"Computer Science","year":"2025"}]'::jsonb,
    '[]'::jsonb,
    82,
    'new'
  )
ON CONFLICT (user_id) DO UPDATE
SET skills = EXCLUDED.skills,
    education = EXCLUDED.education,
    experience = EXCLUDED.experience,
    match_score = EXCLUDED.match_score,
    status = EXCLUDED.status;

INSERT INTO jobs (id, employer_id, title, company, description, requirements, skills, location, salary_min, salary_max, job_type, status)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '22222222-2222-2222-2222-222222222222',
    'Software Engineer',
    'Tech Corp',
    'Build scalable web applications for enterprise clients.',
    ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
    ARRAY['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
    'Bangalore, India',
    80000,
    120000,
    'full_time',
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '22222222-2222-2222-2222-222222222222',
    'Data Scientist',
    'Data Inc',
    'Work on machine learning solutions and data pipelines.',
    ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    'Hyderabad, India',
    100000,
    150000,
    'full_time',
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    '22222222-2222-2222-2222-222222222222',
    'Frontend Developer',
    'Web Solutions',
    'Build modern responsive interfaces using React and TypeScript.',
    ARRAY['React', 'TypeScript', 'CSS', 'HTML'],
    ARRAY['React', 'TypeScript', 'CSS', 'HTML'],
    'Remote',
    60000,
    90000,
    'full_time',
    'active'
  )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    company = EXCLUDED.company,
    description = EXCLUDED.description,
    requirements = EXCLUDED.requirements,
    skills = EXCLUDED.skills,
    location = EXCLUDED.location,
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    job_type = EXCLUDED.job_type,
    status = EXCLUDED.status;

INSERT INTO courses (id, title, description, provider, url, skills, duration, level, rating)
VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    'Complete Python Bootcamp',
    'Learn Python from beginner to advanced level with practical projects.',
    'Udemy',
    'https://www.udemy.com/course/complete-python-bootcamp/',
    ARRAY['Python', 'Django'],
    '22 hours',
    'beginner',
    4.5
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    'React - The Complete Guide',
    'Master React, hooks, and application architecture.',
    'Udemy',
    'https://www.udemy.com/course/react-the-complete-guide/',
    ARRAY['React', 'TypeScript', 'JavaScript'],
    '40 hours',
    'intermediate',
    4.6
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    'Machine Learning A-Z',
    'Practical machine learning for students entering AI roles.',
    'Udemy',
    'https://www.udemy.com/course/machinelearning/',
    ARRAY['Machine Learning', 'TensorFlow', 'Python'],
    '44 hours',
    'intermediate',
    4.5
  )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    provider = EXCLUDED.provider,
    url = EXCLUDED.url,
    skills = EXCLUDED.skills,
    duration = EXCLUDED.duration,
    level = EXCLUDED.level,
    rating = EXCLUDED.rating;

INSERT INTO applications (id, job_id, candidate_id, status, match_score, matched_skills, missing_skills, explanation, notes)
VALUES
  (
    '77777777-7777-7777-7777-777777777771',
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    'pending',
    80,
    ARRAY['Python', 'JavaScript', 'React', 'Node.js'],
    ARRAY['SQL'],
    'Good alignment with core engineering skills; SQL depth can be improved.',
    'Applied through campus placement drive.'
  )
ON CONFLICT (job_id, candidate_id) DO UPDATE
SET status = EXCLUDED.status,
    match_score = EXCLUDED.match_score,
    matched_skills = EXCLUDED.matched_skills,
    missing_skills = EXCLUDED.missing_skills,
    explanation = EXCLUDED.explanation,
    notes = EXCLUDED.notes;

INSERT INTO career_preferences (user_id, role_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'backend_developer')
ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id;

INSERT INTO resume_scores (id, user_id, role_id, score, section_scores, suggestions)
VALUES (
  '88888888-8888-8888-8888-888888888881',
  '11111111-1111-1111-1111-111111111111',
  'backend_developer',
  74,
  '{"skills":78,"projects":62,"experience":68,"education":85}'::jsonb,
  ARRAY[
    'Add one more backend project with API performance metrics.',
    'Improve SQL optimization examples in your experience section.'
  ]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skill_progress (id, user_id, role_id, skill_name, status)
VALUES
  ('99999999-9999-9999-9999-999999999991', '11111111-1111-1111-1111-111111111111', 'backend_developer', 'Node.js', 'completed'),
  ('99999999-9999-9999-9999-999999999992', '11111111-1111-1111-1111-111111111111', 'backend_developer', 'Express', 'in_progress'),
  ('99999999-9999-9999-9999-999999999993', '11111111-1111-1111-1111-111111111111', 'backend_developer', 'Docker', 'missing')
ON CONFLICT (user_id, role_id, skill_name) DO UPDATE
SET status = EXCLUDED.status;

INSERT INTO learning_plans (id, user_id, role_id, duration_days, plan_data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '11111111-1111-1111-1111-111111111111',
  'backend_developer',
  30,
  '{
    "roleId":"backend_developer",
    "roleName":"Backend Developer",
    "durationDays":30,
    "generatedAt":"2026-02-21T00:00:00.000Z",
    "weeks":[{"week":1,"title":"Week 1: Express Focus","goals":["Complete Express routing fundamentals."]}]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO saved_jobs (id, user_id, job_id)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555553')
ON CONFLICT (user_id, job_id) DO NOTHING;
