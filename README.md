# EsenceLab - AI Resume Screening & Job Matching Platform

A full-stack AI-powered resume screening and job matching platform connecting students, recruiters, and administrators.

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Token)

### AI Service
- **Framework:** FastAPI (Python)
- **PDF Processing:** PyPDF2
- **Features:** Resume parsing, skill extraction, job matching

## Features

### For Students
- Browse and search job listings
- Upload and manage resumes with AI parsing
- Apply to jobs
- Track application status
- Get AI-powered job recommendations

### For Recruiters
- Post and manage job listings
- View and manage applicants
- Shortlist/reject candidates
- Schedule interviews
- View match scores

### For Admins
- Manage all users
- View platform analytics
- Manage courses

## Project Structure

```
esencelab/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# Reusable components
│   │   ├── contexts/  # React contexts
│   │   ├── lib/      # Utilities
│   │   └── types/     # TypeScript types
│   └── ...
├── backend/            # Express.js API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── middleware/# Auth middleware
│   │   └── config/   # Database config
│   ├── prisma/       # Database schema
│   └── ...
├── ai-service/        # FastAPI AI service
│   ├── app/
│   │   └── main.py   # AI endpoints
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (local or Supabase)

### 1. Clone and Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
npx prisma generate

# AI Service
cd ai-service
pip install -r requirements.txt
```

### 2. Database Setup

Create a PostgreSQL database and update `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/esencelab"
JWT_SECRET=your-secret-key
```

Push schema to database:
```bash
cd backend
npx prisma db push
```

### 3. Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```env
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret
AI_SERVICE_URL=http://localhost:3002
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - AI Service
cd ai-service
python -m uvicorn app.main:app --reload --port 3002

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Access the app at: http://localhost:3000

## Demo Accounts

After seeding data, you can login with:
- **Student:** student@demo.com / demo123
- **Recruiter:** recruiter@demo.com / demo123
- **Admin:** admin@demo.com / demo123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter/admin)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications` - List applications
- `GET /api/applications/my` - Student's applications
- `POST /api/applications` - Apply to job
- `PUT /api/applications/:id/status` - Update status (recruiter)

### Resume
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume` - Get my resume
- `DELETE /api/resume/:id` - Delete resume

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## AI Service Endpoints

- `POST /ai/parse-resume` - Parse PDF resume
- `POST /ai/match` - Calculate job match score
- `POST /ai/extract-skills` - Extract skills from text

## Deployment

### Vercel (Frontend + Backend)
```bash
cd frontend
vercel deploy
```

### Railway/Render (Backend + Database)
Deploy Express API with PostgreSQL add-on.

### Run locally with Docker
```bash
docker-compose up
```

## License

MIT
