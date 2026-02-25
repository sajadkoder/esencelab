# EsenceLab

AI-powered, role-based campus recruitment platform for students, recruiters, and admins.

## Quick Start (One Shot, No Docker)

This project can run fully local in demo mode with a local in-memory data provider.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-demo.ps1 -InstallDeps -SmokeTest
```

What this does:
- Installs frontend/backend/python dependencies.
- Forces backend to local demo DB mode (`DATA_PROVIDER=memory`).
- Starts AI service, backend, and frontend on `3002`, `3001`, `3000`.
- Runs an end-to-end smoke test for all core flows.

Run later without reinstall:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-demo.ps1 -SmokeTest
```

Run smoke test only (if services are already running):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-smoke.ps1
```

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, JWT, bcrypt
- AI Service: FastAPI, pdfplumber/PyPDF2 (spaCy/scikit-learn optional fallbacks)
- Local Demo DB: In-memory provider (`DATA_PROVIDER=memory`)
- Optional Persistent DB: Supabase Postgres

## Demo URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- AI Service: `http://localhost:3002`

## Demo Credentials
- Student: `student@esencelab.com` / `demo123`
- Employer: `recruiter@esencelab.com` / `demo123`
- Admin: `admin@esencelab.com` / `demo123`

## Features Covered
- Role-based authentication and route protection
- Student resume upload + AI parsing
- AI skill extraction + similarity scoring
- Resume strength scoring with section-wise feedback
- Skill roadmap with progress tracking
- Personalized 30/60-day learning plans + weekly planner
- Mock interview assistant with session logging
- Career role explorer and recommendation explanations
- Job tracker (saved jobs + application notes/stages)
- Job CRUD and application lifecycle
- Recruiter candidate match ranking
- Recommendations with missing skills and courses
- Admin user/course management
- Role-based dashboard stats

## Team Members
- Sajad (GitHub: `sajadkoder`) - Project lead, full-stack implementation, AI workflow integration

## Credits
- Open-source frameworks and libraries: Next.js, React, Express, FastAPI, Supabase, Tailwind CSS
- Python PDF/NLP ecosystem used in this project: PyPDF2, pdfplumber

## Build Specs And Chunks
- Master feature spec: [docs/MASTER_BUILD_SPEC.md](docs/MASTER_BUILD_SPEC.md)
- Chunked execution plan: [docs/CHUNKED_IMPLEMENTATION_PLAN.md](docs/CHUNKED_IMPLEMENTATION_PLAN.md)

## Manual Setup (If You Prefer)

### 1) Prerequisites
- Node.js 18+
- Python 3.11+ (tested with Python 3.14 in local demo mode)

### 2) Install dependencies
```bash
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && pip install -r requirements.txt
```

### 3) Configure backend for local demo mode
Create `backend/.env`:

```env
PORT=3001
JWT_SECRET=change-me
AI_SERVICE_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3000
DATA_PROVIDER=memory
```

### 4) Configure frontend
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3002/ai
```

### 5) Start services (3 terminals)
```bash
# terminal 1
cd ai-service
python -m uvicorn app.main:app --reload --port 3002

# terminal 2
cd backend
npm run dev

# terminal 3
cd frontend
npm run dev
```

## Optional Supabase Mode

If you want persistence:
1. Set `DATA_PROVIDER=supabase` in `backend/.env`.
2. Add `SUPABASE_URL` and key(s).
3. Run SQL in Supabase SQL editor:
   - `supabase-schema.sql`
   - `supabase-seed.sql`

The schema includes extended tables for growth features:
- `resume_scores`
- `skill_progress`
- `learning_plans`
- `mock_interview_sessions`
- `saved_jobs`
- `career_preferences`

## Repository Structure
- `frontend/`: Next.js app
- `backend/`: Express API
- `ai-service/`: FastAPI service
- `scripts/local-demo.ps1`: one-shot local setup + run
- `scripts/local-smoke.ps1`: end-to-end smoke test
- `supabase-schema.sql`: Supabase schema
- `supabase-seed.sql`: Supabase seed data

## Build Verification
```bash
cd backend && npm run build
cd ../frontend && npm run build
cd ../ai-service && python -m py_compile app/main.py
```

## New Career APIs (Student)
- `GET /api/career/roles`
- `POST /api/career/target-role`
- `GET /api/career/overview`
- `GET /api/career/roadmap`
- `PUT /api/career/roadmap/skill`
- `GET /api/career/learning-plan?durationDays=30|60`
- `POST /api/career/learning-plan`
- `GET /api/career/mock-interview`
- `POST /api/career/mock-interview/session`
- `GET /api/career/job-tracker`
- `POST /api/career/job-tracker/save`
- `DELETE /api/career/job-tracker/save/:jobId`
- `PUT /api/career/job-tracker/application/:applicationId`
