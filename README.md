# Esencelab - AI-Powered Campus Recruitment Platform

<div align="center">

![Esencelab Logo](https://img.shields.io/badge/Esencelab-Campus%20Recruitment-black?style=for-the-badge)

**A comprehensive campus recruitment platform connecting students with opportunities through AI-powered resume parsing, intelligent job matching, and personalized course recommendations.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?style=flat-square&logo=python)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google)

[Features](#features) • [Architecture](#architecture) • [Installation](#installation) • [Team](#team)

</div>

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│                         Frontend: React + Vite + TypeScript                 │
│                              Port: 5173 / 3000                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
┌───────────────────────────────────┐  ┌─────────────────────────────────────┐
│       EXPRESS.JS BACKEND          │  │         FASTAPI AI SERVICE          │
│           (Node.js)               │  │            (Python)                 │
│           Port: 4000              │  │           Port: 8000                │
├───────────────────────────────────┤  ├─────────────────────────────────────┤
│  • Authentication (JWT)           │  │  • Resume Parsing (spaCy)           │
│  • Jobs CRUD                      │  │  • AI Enhancement (Gemini)          │
│  • Candidates Management          │  │  • Career Chatbot (Gemini)          │
│  • Applications Tracking          │  │  • Job Matching Algorithm           │
│  • Course Recommendations         │  │  • Skill Gap Analysis               │
└───────────────────────────────────┘  └─────────────────────────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│                     Supabase (PostgreSQL + Auth + Realtime)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + Vite + TypeScript | UI with Y Combinator black/white theme |
| **Backend** | Node.js + Express | REST API with JWT authentication |
| **AI Service** | FastAPI (Python) | ML/AI microservice |
| **NLP** | spaCy (en_core_web_lg) | Resume parsing & entity extraction |
| **AI** | Google Gemini API | Resume enhancement & chatbot |
| **Database** | Supabase (PostgreSQL) | Data storage with RLS |
| **Deployment** | Vercel + Railway | Production hosting |

---

## Project Structure

```
esencelab/
├── src/                          # Frontend (React + Vite)
│   ├── components/
│   │   ├── layout/               # Header, Sidebar
│   │   ├── profile/              # TargetRoleSelector
│   │   └── ui/                   # 50+ UI components
│   ├── pages/                    # Dashboard pages
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities
│   ├── store/                    # Zustand state
│   └── types/                    # TypeScript types
│
├── server/                       # Express Backend (Node.js)
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, error handling
│   │   └── config/               # Supabase client
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/                   # FastAPI AI Service (Python)
│   ├── app/
│   │   ├── routers/              # API endpoints
│   │   │   ├── resume.py         # Resume parsing
│   │   │   ├── chatbot.py        # Career chatbot
│   │   │   └── matching.py       # Job matching
│   │   ├── services/
│   │   │   ├── nlp_service.py    # spaCy processing
│   │   │   ├── gemini_service.py # Gemini API
│   │   │   └── matching_service.py
│   │   └── models/               # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # Docker orchestration
├── vercel.json                   # Vercel deployment
└── supabase-setup.sql            # Database schema
```

---

## Features

### For Students
- AI Resume Parser (spaCy + Gemini)
- Job search with filters
- Application tracking
- Saved jobs
- Course recommendations (YouTube, GFG, Scaler, etc.)
- Career chatbot (Gemini-powered)

### For Recruiters
- Candidate pipeline management
- Status tracking (New → Screening → Interview → Hired)
- Match scores

### For Admins
- Analytics dashboard
- User management
- Activity logs

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn
- Supabase account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/sajadkoder/esencelab.git
cd esencelab

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install AI service dependencies
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..
```

### 2. Environment Variables

Create `.env` files:

**Root `.env.local**:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000/api
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your-gemini-key
```

**server/.env**:
```env
PORT=4000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
AI_SERVICE_URL=http://localhost:8000
```

**ai-service/.env**:
```env
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Services

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server && npm run dev

# Terminal 3: AI Service
cd ai-service && uvicorn app.main:app --reload
```

### 4. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| AI Service | http://localhost:8000 |

---

## API Documentation

### Express Backend (Port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/jobs` | List all jobs |
| `POST` | `/api/jobs` | Create job (employer) |
| `GET` | `/api/candidates` | List candidates |
| `PUT` | `/api/candidates/:id/status` | Update status |
| `POST` | `/api/applications` | Apply to job |
| `GET` | `/api/courses` | List courses |

### FastAPI AI Service (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/resume/parse` | Parse resume with spaCy + Gemini |
| `POST` | `/resume/extract-skills` | Extract skills from text |
| `POST` | `/chatbot/chat` | Career chatbot with Gemini |
| `POST` | `/matching/match` | Calculate job match score |
| `POST` | `/matching/skill-gaps` | Analyze skill gaps |

---

## AI Features

### Resume Parsing Pipeline

```
Resume Upload → PDF Extraction → spaCy NER → Gemini Enhancement → Structured Output
```

**spaCy Extracts:**
- Named entities (PERSON, ORG, GPE, DATE)
- Skills using custom ontology (30+ categories)
- Education patterns
- Experience details

**Gemini Enhances:**
- Professional summary generation
- Skill categorization
- Missing skill inference
- Job role suggestions

---

## Deployment

### Docker Compose

```bash
docker-compose up --build
```

### Individual Deployment

**Frontend (Vercel)**:
```bash
vercel
```

**Backend (Railway)**:
```bash
railway init && railway up
```

---

## Team Members

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Sajad** | Lead Developer | Architecture, Core Features, Integration |
| **Harikrishnan K** | Frontend Developer | UI Components, Dashboard Design |
| **Adwaith PC** | Backend Developer | Database Design, API Development |
| **Jishnu MR** | AI/ML Developer | spaCy Integration, Gemini API |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `cd server && npm run dev` | Start backend server |
| `cd ai-service && uvicorn app.main:app --reload` | Start AI service |

---

## License

MIT License

---

**Built with ❤️ by Esencelab Team**
