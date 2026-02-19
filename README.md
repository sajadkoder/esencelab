# Esencelab

AI-powered campus recruitment platform with:
- Clerk authentication + role metadata (`student`, `employer`, `admin`)
- Supabase database + row-level security (RLS)
- Serverless AI API on Vercel (`/api/ai/*`) in Node.js

## Feature Coverage

### Core AI
- Resume parsing + structured extraction (skills, education, experience, contact details)
- NER-style entity extraction
- Custom skill ontology matching
- TF-IDF + cosine similarity skill-gap and matching engine
- Job recommendation ranking
- Course recommendation ranking
- Resume summarization (Gemini)
- Recommendation explanation generation
- Career chatbot assistance

### Student
- Register / login
- Resume upload (PDF/TXT)
- Parsed profile view
- Skill-gap analysis
- Top job recommendations
- Course suggestions
- Resume summary
- AI chatbot

### Recruiter
- Register / login
- Post jobs
- Search/filter candidates by skills
- View structured candidate profile insights
- AI candidate ranking and match results

### Admin
- Manage users (roles)
- Manage jobs and courses
- Analytics overview
- Usage/activity monitoring
- CSV report generation

### Security
- JWT-based auth (Clerk tokens)
- Role-based authorization (frontend + serverless API)
- Supabase RLS policies
- Authenticated REST API communication

## Architecture

- Frontend: React + Vite + TypeScript
- Auth: Clerk
- Database: Supabase PostgreSQL
- AI API: Vercel serverless functions in `api/ai/*`
- AI model: Gemini (optional but recommended)

## Environment Variables

Use `.env.example` as reference.

Required:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Optional:
- `VITE_AI_SERVICE_URL` (default: `/api/ai`)
- `VITE_CLERK_API_TEMPLATE`
- `VITE_CLERK_SUPABASE_TEMPLATE` (default: `supabase`)
- `GEMINI_MODEL` (default: `gemini-2.0-flash`)

## Local Setup

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Supabase Setup

Run `supabase-schema.sql` in Supabase SQL editor to create tables, indexes, and RLS policies.

Important:
- Configure Supabase to accept Clerk JWTs.
- Ensure role metadata is present in Clerk token claims (`public_metadata.role` or equivalent).

## Deployment

Already configured for Vercel with `vercel.json`:
- Static frontend build output from Vite
- Serverless AI endpoints from `api/ai/*`

## Notes

- AI functionality is implemented through Node.js serverless endpoints in `api/ai/*`.
