# EsenceLab - AI-Powered Campus Recruitment Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-green?style=for-the-badge&logo=express" alt="Express.js" />
  <img src="https://img.shields.io/badge/FastAPI-AI%20Service-blue?style=for-the-badge&logo=python" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
</div>

<div align="center">
  <h3>AI-Powered Resume Screening & Job Matching Platform</h3>
  <p>Built with ❤️ for SNGCET College Placement Cell</p>
</div>

---

## Overview

EsenceLab is a full-stack AI-powered campus recruitment platform that connects students with recruiters through intelligent resume screening and job matching. Originally developed as a college project, it demonstrates the practical application of AI/ML in the recruitment domain.

### Built With

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Context API

**Backend:**
- Express.js
- JWT Authentication
- Multer (File Uploads)

**AI Service:**
- FastAPI (Python)
- PyPDF2 (PDF Processing)
- scikit-learn (TF-IDF Matching)

**Database:**
- PostgreSQL (Supabase)
- In-memory storage (Demo mode)

---

## Features

### For Students
- AI Resume Screening - Upload PDF, auto-extract skills
- Smart Job Matching - AI-powered recommendations
- Application Tracking - Real-time status updates
- Course Recommendations - Skill gap analysis

### For Recruiters
- Job Posting - Create and manage listings
- Candidate Search - Browse student profiles
- AI Matching - Get ranked candidates
- Application Management - Review and update status

### For Admins
- User Management
- Platform Analytics
- Course Management

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/sajadkoder/esencelab.git
cd esencelab

# Install frontend
cd frontend && npm install

# Install backend
cd ../backend && npm install

# Install AI service
cd ../ai-service && pip install -r requirements.txt
```

### Run the Application

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - AI Service:**
```bash
cd ai-service && python -m uvicorn app.main:app --reload --port 3002
```

**Terminal 3 - Frontend:**
```bash
cd frontend && npm run dev
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **AI Service:** http://localhost:3002

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@esencelab.com | demo123 |
| Employer | recruiter@esencelab.com | demo123 |
| Admin | admin@esencelab.com | demo123 |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   AI Service    │
│   Next.js       │     │   Express.js    │     │   FastAPI       │
│   Port 3000     │     │   Port 3001     │     │   Port 3002     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List jobs |
| GET | /api/jobs/:id | Get job |
| POST | /api/jobs | Create job |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applications | List applications |
| POST | /api/applications | Apply to job |
| PUT | /api/applications/:id/status | Update status |

---

## Project Structure

```
esencelab/
├── frontend/          # Next.js app
│   ├── src/app/       # Pages
│   ├── components/    # UI components
│   └── contexts/      # State management
├── backend/           # Express.js API
│   └── src/           # Routes & logic
├── ai-service/        # FastAPI AI
│   └── app/           # ML endpoints
└── README.md
```

---

## Tech Stack Details

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 | React framework with App Router |
| Styling | Tailwind CSS | Utility-first CSS |
| Backend | Express.js | REST API server |
| Auth | JWT | Token-based authentication |
| AI | FastAPI | Python ML service |
| PDF | PyPDF2 | Resume text extraction |
| ML | scikit-learn | TF-IDF job matching |

---

## College Project Details

- **Project:** AI-Powered Campus Recruitment Platform
- **College:** SNGCET
- **Year:** 2026
- **Team:** Sajad K, Harikrishnan, Jishnu, Adwatath

---

## License

Educational project for college curriculum.

---

<div align="center">
  <p>© 2026 EsenceLab. College Project.</p>
</div>
