-- Esencelab non-destructive auth migration:
-- Clerk-based JWT claim assumptions -> Supabase Auth JWT claims
-- Run this in Supabase SQL Editor for existing deployments.

CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(auth.jwt()->>'sub', auth.jwt()->>'user_id');
$$;

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT public.auth_user_id();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT LOWER(
    COALESCE(
      auth.jwt()->'app_metadata'->>'role',
      auth.jwt()->'user_metadata'->>'role',
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
      AND c.clerk_user_id = public.auth_user_id()
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
      AND p.clerk_user_id = public.auth_user_id()
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "jobs_select_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_policy" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_policy" ON public.jobs;
DROP POLICY IF EXISTS "candidates_select_policy" ON public.candidates;
DROP POLICY IF EXISTS "candidates_insert_policy" ON public.candidates;
DROP POLICY IF EXISTS "candidates_update_policy" ON public.candidates;
DROP POLICY IF EXISTS "applications_select_policy" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_policy" ON public.applications;
DROP POLICY IF EXISTS "applications_update_policy" ON public.applications;
DROP POLICY IF EXISTS "courses_select_policy" ON public.courses;
DROP POLICY IF EXISTS "courses_write_policy" ON public.courses;
DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_policy" ON public.activity_logs;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  clerk_user_id = public.auth_user_id()
  OR LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  OR public.current_user_role() IN ('admin', 'employer')
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (clerk_user_id = public.auth_user_id());

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  clerk_user_id = public.auth_user_id()
  OR LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  OR public.current_user_role() = 'admin'
)
WITH CHECK (
  clerk_user_id = public.auth_user_id()
  OR LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
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
      SELECT p.id FROM public.profiles p WHERE p.clerk_user_id = public.auth_user_id()
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
  clerk_user_id = public.auth_user_id()
  OR public.current_user_role() IN ('employer', 'admin')
);

CREATE POLICY "candidates_insert_policy" ON public.candidates
FOR INSERT
WITH CHECK (
  clerk_user_id = public.auth_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
);

CREATE POLICY "candidates_update_policy" ON public.candidates
FOR UPDATE
USING (
  clerk_user_id = public.auth_user_id()
  OR public.current_user_role() IN ('admin', 'employer')
)
WITH CHECK (
  clerk_user_id = public.auth_user_id()
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
  OR clerk_user_id = public.auth_user_id()
);

CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs
FOR INSERT
WITH CHECK (
  clerk_user_id = public.auth_user_id()
  OR public.current_user_role() = 'admin'
);
