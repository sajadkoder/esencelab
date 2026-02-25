# Esencelab

AI-powered resume parsing and career intelligence platform for students, recruiters, and admins.

## Overview
Esencelab helps students understand job readiness, identify skill gaps, and follow structured improvement plans, while giving recruiters faster candidate ranking and decision support.

## Core Features
- Resume upload and AI parsing (PDF to structured profile)
- Resume strength scoring (0-100 with section-wise feedback)
- Skill-gap analysis using TF-IDF and cosine similarity
- Personalized job recommendations and learning plans (30/60-day)
- Skill roadmap tracking and mock interview assistant
- Recruiter job posting and candidate ranking by match score
- Admin monitoring for users, resumes, jobs, and applications

## Architecture
`Next.js Frontend -> Express Backend API -> FastAPI AI Service -> Supabase/Postgres (or in-memory demo mode)`

## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, JWT, bcrypt
- AI Service: FastAPI, Python, pdfplumber, PyPDF2
- Database: Supabase Postgres (optional memory mode for local demo)

## Quick Start (One Command)
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-demo.ps1 -InstallDeps -SmokeTest
```

Run again without reinstall:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-demo.ps1 -SmokeTest
```

Smoke test only:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-smoke.ps1
```

## Local URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api`
- AI Service: `http://localhost:3002`

## Demo Credentials
- Student: `student@esencelab.com` / `demo123`
- Recruiter: `recruiter@esencelab.com` / `demo123`
- Admin: `admin@esencelab.com` / `demo123`

## Project Docs
- Master spec: [docs/MASTER_BUILD_SPEC.md](docs/MASTER_BUILD_SPEC.md)
- Chunked plan: [docs/CHUNKED_IMPLEMENTATION_PLAN.md](docs/CHUNKED_IMPLEMENTATION_PLAN.md)

## Team and Credits
### Team Members
- **Abdulla Sajad** - Backend development, database implementation, system architecture
- **Harikrishnan K** - Frontend development, UI design
- **Adwaith PC** - Documentation, system design support, presentation planning
- **Jishnu MR** - Testing, validation, research support

### Credits
- Built with: Next.js, React, Express, FastAPI, Supabase, Tailwind CSS
- AI/PDF tooling: pdfplumber, PyPDF2
