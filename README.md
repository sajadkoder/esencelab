# SNGCET CareerHub - AI-Powered Campus Recruitment Platform

A full-stack AI-powered campus recruitment platform designed for college placement cells. This project connects SNGCET students with recruiters through intelligent resume screening and job matching.

## 📋 Project Overview

**Project Name:** SNGCET CareerHub  
**Project Type:** College Major Project  
**College:** Sree Narayana Gurudev College of Engineering & Technology (SNGCET)  
**Tech Stack:** Next.js, Express.js, FastAPI, PostgreSQL

## 🎯 Features

### For Students
- **AI Resume Screening** - Upload PDF resumes, AI automatically extracts skills, education, and experience
- **Smart Job Matching** - Get personalized job recommendations based on your profile
- **Application Tracking** - Track your job applications in real-time
- **Course Recommendations** - Discover courses to bridge skill gaps
- **Profile Management** - Manage your career profile and skills

### For Recruiters/Employers
- **Job Posting** - Post jobs with required skills and qualifications
- **Candidate Search** - Browse and search potential candidates
- **Application Management** - View, shortlist, and manage applicants
- **AI Candidate Matching** - Get AI-powered candidate recommendations
- **Application Status Tracking** - Track application status in real-time

### For Administrators
- **User Management** - Manage students and recruiters
- **Platform Analytics** - View placement statistics
- **Course Management** - Add and manage learning resources

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                   http://localhost:3000                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express.js)                     │
│                   http://localhost:3001                      │
│  - REST API                                                 │
│  - JWT Authentication                                       │
│  - In-memory Database (demo mode)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────────┐
│   AI Service (FastAPI)  │ │  Database (PostgreSQL)      │
│   http://localhost:3002 │ │  (Optional - Supabase)       │
│  - Resume Parsing       │ │                              │
│  - Skill Extraction    │ │                              │
│  - Job Matching        │ │                              │
└─────────────────────────┘ └─────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Token)
- **Database:** PostgreSQL with Prisma ORM (or in-memory for demo)

### AI Service
- **Framework:** FastAPI (Python)
- **PDF Processing:** PyPDF2
- **NLP:** spaCy, scikit-learn (TF-IDF)
- **Features:** Resume parsing, skill extraction, job matching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sajadkoder/esencelab.git
cd esencelab
```

2. **Install Frontend Dependencies:**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies:**
```bash
cd ../backend
npm install
```

4. **Install AI Service Dependencies:**
```bash
cd ../ai-service
pip install -r requirements.txt
```

### Running the Application

You need to run **3 terminals** simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Service:**
```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 3002
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **AI Service:** http://localhost:3002

## 📝 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@esencelab.com | demo123 |
| Employer | recruiter@esencelab.com | demo123 |
| Admin | admin@esencelab.com | demo123 |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all active jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer/admin)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications` - List applications
- `GET /api/applications/my` - My applications
- `POST /api/applications` - Apply to job
- `PUT /api/applications/:id/status` - Update status (employer)

### Resume
- `POST /api/resume/upload` - Upload resume (PDF)
- `GET /api/resume` - Get my resume
- `DELETE /api/resume/:id` - Delete resume

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Add course (admin)

### Dashboard
- `GET /api/dashboard/stats` - Get role-specific statistics

## 🤖 AI Service Endpoints

- `POST /ai/parse-resume` - Parse PDF resume and extract data
- `POST /ai/match` - Calculate job match score
- `POST /ai/extract-skills` - Extract skills from text

## 📁 Project Structure

```
esencelab/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── ...
│
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── index.ts       # Main server file
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Auth middleware
│   └── ...
│
├── ai-service/             # FastAPI AI service
│   ├── app/
│   │   └── main.py        # AI endpoints
│   └── requirements.txt
│
└── README.md
```

## 🔧 Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3002/ai
```

### Backend (.env)
```env
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3000
```

## 📊 Features in Detail

### 1. AI Resume Screening
- Upload PDF resume
- Automatic text extraction using PyPDF2
- NLP-based skill extraction
- Education and experience parsing
- Store parsed data in JSON format

### 2. Smart Job Matching
- TF-IDF vectorization of skills
- Cosine similarity calculation
- Match score (0-100%)
- Missing skills identification

### 3. Role-Based Dashboards
- Student Dashboard: Applications, recommendations, courses
- Employer Dashboard: Posted jobs, applicants, statistics
- Admin Dashboard: User management, platform analytics

### 4. Application Tracking
- Real-time application status
- Status: pending, shortlisted, interview, accepted, rejected
- Employer can update status

## 📝 College Project Details

- **Project Title:** AI-Powered Campus Recruitment Platform
- **College:** Sree Narayana Gurudev College of Engineering & Technology (SNGCET)
- **Department:** Computer Science & Engineering
- **Year:** 2024-2025
- **Guide:** [Your Guide Name]
- **Students:** Sajad K, Harikrishnan, Jishnu, Adwatath

## 🙏 Acknowledgments

- SNGCET College for providing this opportunity
- All faculty members for their guidance
- Open source communities for libraries used

## 📄 License

This project is for educational purposes as part of college curriculum.

---

**Note:** This is a college project demonstrating AI-powered recruitment. 
The demo uses in-memory storage - for production, configure PostgreSQL database.
