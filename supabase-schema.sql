-- Esencelab Supabase schema with Clerk JWT + RBAC + RLS
-- Run in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
    CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
    CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'hired', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level') THEN
    CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
END $$;

DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  job_type job_type DEFAULT 'full-time',
  status job_status DEFAULT 'active',
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT,
  url TEXT,
  skills TEXT[] DEFAULT '{}',
  duration TEXT,
  level course_level,
  rating DECIMAL(3,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  clerk_user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(auth.jwt()->>'sub', auth.jwt()->>'user_id');
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT LOWER(
    COALESCE(
      auth.jwt()->'public_metadata'->>'role',
      auth.jwt()->'metadata'->>'role',
      auth.jwt()->'unsafe_metadata'->>'role',
      auth.jwt()->>'role',
      'student'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_candidate_owner(candidate_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidates c
    WHERE c.id = candidate_uuid
      AND c.clerk_user_id = public.clerk_user_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_employer_job_owner(job_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.jobs j
    JOIN public.profiles p ON p.id = j.employer_id
    WHERE j.id = job_uuid
      AND p.clerk_user_id = public.clerk_user_id()
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (clerk_user_id = public.clerk_user_id());

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() = 'admin'
)
WITH CHECK (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() = 'admin'
);

CREATE POLICY "jobs_select_policy" ON public.jobs
FOR SELECT
USING (
  status = 'active'
  OR public.is_employer_job_owner(id)
  OR public.current_user_role() = 'admin'
);

CREATE POLICY "jobs_insert_policy" ON public.jobs
FOR INSERT
WITH CHECK (
  public.current_user_role() IN ('employer', 'admin')
  AND (
    public.current_user_role() = 'admin'
    OR employer_id IN (
      SELECT p.id FROM public.profiles p WHERE p.clerk_user_id = public.clerk_user_id()
    )
  )
);

CREATE POLICY "jobs_update_policy" ON public.jobs
FOR UPDATE
USING (
  public.current_user_role() = 'admin'
  OR public.is_employer_job_owner(id)
)
WITH CHECK (
  public.current_user_role() = 'admin'
  OR public.is_employer_job_owner(id)
);

CREATE POLICY "jobs_delete_policy" ON public.jobs
FOR DELETE
USING (
  public.current_user_role() = 'admin'
  OR public.is_employer_job_owner(id)
);

CREATE POLICY "candidates_select_policy" ON public.candidates
FOR SELECT
USING (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() IN ('employer', 'admin')
);

CREATE POLICY "candidates_insert_policy" ON public.candidates
FOR INSERT
WITH CHECK (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
);

CREATE POLICY "candidates_update_policy" ON public.candidates
FOR UPDATE
USING (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
)
WITH CHECK (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
);

CREATE POLICY "applications_select_policy" ON public.applications
FOR SELECT
USING (
  public.is_candidate_owner(candidate_id)
  OR public.is_employer_job_owner(job_id)
  OR public.current_user_role() = 'admin'
);

CREATE POLICY "applications_insert_policy" ON public.applications
FOR INSERT
WITH CHECK (
  public.is_candidate_owner(candidate_id)
  OR public.current_user_role() = 'admin'
);

CREATE POLICY "applications_update_policy" ON public.applications
FOR UPDATE
USING (
  public.is_candidate_owner(candidate_id)
  OR public.is_employer_job_owner(job_id)
  OR public.current_user_role() = 'admin'
)
WITH CHECK (
  public.is_candidate_owner(candidate_id)
  OR public.is_employer_job_owner(job_id)
  OR public.current_user_role() = 'admin'
);

CREATE POLICY "courses_select_policy" ON public.courses
FOR SELECT
USING (true);

CREATE POLICY "courses_write_policy" ON public.courses
FOR ALL
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
FOR SELECT
USING (
  public.current_user_role() = 'admin'
  OR clerk_user_id = public.clerk_user_id()
);

CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs
FOR INSERT
WITH CHECK (
  clerk_user_id = public.clerk_user_id()
  OR public.current_user_role() = 'admin'
);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX idx_candidates_clerk_user_id ON public.candidates(clerk_user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
