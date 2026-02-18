# Technical Documentation - Esencelab

## Project Overview

Esencelab is an AI-powered campus recruitment platform designed for Indian students and colleges using a microservices architecture with Express backend and FastAPI AI service.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Radix UI | Latest | Accessible Components |
| Framer Motion | 12.x | Animations |
| TanStack Query | 5.x | Server State |
| Zustand | 5.x | Client State |

### Backend (Express)
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express 4.x | Web Framework |
| TypeScript | Type Safety |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Zod | Validation |
| Supabase Client | Database |

### AI Service (FastAPI)
| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Runtime |
| FastAPI | Web Framework |
| spaCy 3.7 | NLP Processing |
| en_core_web_lg | NER Model |
| Google Gemini | AI Enhancement |
| Pydantic | Data Validation |
| PyPDF2/pdfplumber | PDF Processing |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│ Express Backend │────▶│ FastAPI AI      │
│  React + Vite   │     │   Node.js       │     │   Python        │
│   Port 5173     │     │   Port 4000     │     │   Port 8000     │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 └───────────┬───────────┘
                                             ▼
                                 ┌─────────────────────┐
                                 │     Supabase        │
                                 │    PostgreSQL       │
                                 └─────────────────────┘
```

---

## API Endpoints

### Express Backend (Port 4000)
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/candidates` - List candidates
- `POST /api/applications` - Apply to job
- `GET /api/courses` - List courses

### FastAPI AI Service (Port 8000)
- `POST /resume/parse` - Parse resume (spaCy + Gemini)
- `POST /chatbot/chat` - Career chatbot (Gemini)
- `POST /matching/match` - Job matching algorithm
- `POST /matching/skill-gaps` - Skill gap analysis

---

## Team Responsibilities

| Member | Role | Technologies |
|--------|------|--------------|
| **Sajad** | Lead Developer | Architecture, Integration |
| **Harikrishnan K** | Frontend | React, Tailwind, UI |
| **Adwaith PC** | Backend | Express, Supabase, APIs |
| **Jishnu MR** | AI/ML | spaCy, Gemini, Matching |

---

**Version:** 2.0 | **Updated:** February 2026
