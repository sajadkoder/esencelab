# Esencelab

Esencelab is an AI-powered campus recruitment platform for students, recruiters, and admins.

## Stack
- Frontend: React + Vite + TypeScript
- Auth: Supabase Auth (email/password)
- Database: Supabase PostgreSQL + RLS
- AI API: Vercel serverless functions (`api/ai/*`, Node.js runtime)
- LLM: Gemini (for summary/chat/explanations)

## Main Features
### Student
- Sign up / login
- Resume upload (PDF/TXT)
- AI resume parsing (skills, education, experience, contact details)
- Skill-gap analysis
- Job recommendations
- Course recommendations
- Resume summary
- Career chatbot

### Recruiter
- Sign up / login
- Post live jobs
- Search and filter candidates by skills
- View candidate profiles and structured resume insights
- View applicants for jobs
- AI-based candidate ranking

### Admin
- Manage users and roles
- Manage jobs and courses
- Usage analytics and monitoring
- Review resume upload outputs and recommendation logs
- CSV reports

### Security
- JWT auth with Supabase access tokens
- Role-based authorization (frontend + API)
- Row-Level Security (RLS) in Supabase

## Auth and Roles
- Public signup roles: `student`, `employer`
- `admin` is invite-only
- Role is stored in profile + Supabase user metadata

## Quick Start
1. Install dependencies:
```bash
npm install
```
2. Create `.env` from `.env.example` and fill values.
3. Start dev server:
```bash
npm run dev
```
4. Open `http://localhost:5173`.

## Environment Variables
Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Optional:
- `VITE_AI_SERVICE_URL` (default: `/api/ai`)
- `GEMINI_MODEL` (default: `gemini-2.0-flash`)

## Database Setup
For a fresh setup:
1. Run `supabase-schema.sql` in Supabase SQL editor.

For existing Clerk-era projects migrating to Supabase Auth:
1. Run `supabase-auth-migration.sql` in Supabase SQL editor.
2. This keeps existing tables and updates auth helper functions + RLS policies to Supabase JWT claims.

## Build and Checks
```bash
npm run lint
npm run build
```

## Deployment (Vercel)
Project is preconfigured with `vercel.json`.
- Frontend is built from Vite (`dist`)
- API routes are served from `api/ai/*`
- Set all required environment variables in Vercel project settings

## Troubleshooting
- `Failed to get response from API`: check `VITE_AI_SERVICE_URL` and ensure `/api/ai/*` routes are deployed.
- `AI request failed`: check `GEMINI_API_KEY` and logs in Vercel Functions.
- Auth/RLS issues: confirm migration SQL ran successfully and user role metadata exists.
