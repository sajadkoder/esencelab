# EsenceLab - AI Resume Screening & Job Matching Platform

## 1. Project Overview

**Project Name:** EsenceLab  
**Project Type:** Full-stack Web Application (Next.js + Express.js + FastAPI + PostgreSQL)  
**Core Functionality:** AI-powered resume screening and job matching platform connecting students, recruiters, and administrators  
**Target Users:** Students/Job Seekers, Recruiters, Administrators

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, Context API)
- **HTTP Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt
- **Database ORM:** Prisma
- **Deployment:** Vercel Serverless Functions

### AI Service
- **Framework:** FastAPI
- **Language:** Python 3.11+
- **NLP:** spaCy
- **PDF Processing:** pdfplumber
- **ML:** scikit-learn (TF-IDF), NumPy
- **Optional:** Gemini API for explanations

### Database
- **System:** PostgreSQL (Supabase)
- **Features:** Relational tables, JSONB, RLS

---

## 3. UI/UX Specification

### Color Palette
- **Primary:** #0F172A (Slate 900 - Dark Navy)
- **Secondary:** #3B82F6 (Blue 500 - Bright Blue)
- **Accent:** #10B981 (Emerald 500 - Green)
- **Warning:** #F59E0B (Amber 500)
- **Error:** #EF4444 (Red 500)
- **Background:** #F8FAFC (Slate 50)
- **Card Background:** #FFFFFF
- **Text Primary:** #1E293B (Slate 800)
- **Text Secondary:** #64748B (Slate 500)
- **Border:** #E2E8F0 (Slate 200)

### Typography
- **Font Family:** Inter (Google Fonts)
- **Headings:** 
  - H1: 36px, Bold (700)
  - H2: 30px, Bold (700)
  - H3: 24px, SemiBold (600)
  - H4: 20px, SemiBold (600)
- **Body:** 16px, Regular (400)
- **Small:** 14px, Regular (400)
- **Caption:** 12px, Regular (400)

### Spacing System
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Structure

#### Global Navigation (All Roles)
- Logo (left)
- Navigation Links (center): Dashboard, Jobs, Courses (role-dependent)
- User Menu (right): Profile dropdown with logout
- Mobile: Hamburger menu

#### Page Layouts

**1. Landing Page (Unauthenticated)**
- Hero section with tagline
- Features overview (3 cards)
- CTA buttons: Login, Register
- Footer

**2. Authentication Pages**
- Login form (email, password, role selection)
- Register form (name, email, password, role)
- Clean centered card design

**3. Student Dashboard**
- Welcome banner with name
- Quick stats: Applications, Interviews, Saved Jobs
- Recommended jobs grid (3 columns)
- Recent applications list
- Resume upload section

**4. Recruiter Dashboard**
- Welcome banner
- Stats: Posted Jobs, Total Applicants, Interviews Scheduled
- Posted jobs table with actions
- Applicant shortlisting section

**5. Admin Dashboard**
- Stats overview: Users, Jobs, Resumes
- User management table
- Platform analytics

**6. Resume Upload Page**
- Drag & drop zone
- File preview
- Upload progress bar
- Parsed data display

**7. Recommendations Panel**
- Job cards with match percentage
- Skill match indicators
- Apply/Save buttons

### Components

#### Buttons
- **Primary:** Blue background (#3B82F6), white text, rounded-lg
- **Secondary:** White background, blue border, blue text
- **Danger:** Red background (#EF4444), white text
- **States:** Hover (darken 10%), Active (darken 15%), Disabled (opacity 50%)

#### Cards
- White background
- Rounded-xl (12px)
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 24px

#### Form Inputs
- Border: 1px solid #E2E8F0
- Rounded-lg (8px)
- Padding: 12px 16px
- Focus: Blue ring (#3B82F6)

#### Tables
- Header: Slate 100 background
- Rows: Alternating white/slate-50
- Hover: Slate-100

#### Badges
- **Success:** Green background
- **Warning:** Amber background
- **Error:** Red background
- **Info:** Blue background
- Rounded-full, padding 4px 12px

---

## 4. Functionality Specification

### Authentication
- JWT-based authentication
- Role-based access control (Student, Recruiter, Admin)
- Protected routes based on role
- Token refresh mechanism
- Logout clears tokens

### User Roles & Permissions

**Student**
- Register/Login
- Upload resumes
- Browse jobs
- Apply to jobs
- View recommendations
- Save jobs
- Track applications

**Recruiter**
- Register/Login
- Post jobs
- View applicants
- Shortlist/reject applicants
- Schedule interviews
- Manage posted jobs

**Admin**
- View all users
- Manage users (activate/deactivate)
- View platform analytics
- Manage courses

### Resume Processing (AI Service)
- PDF text extraction (pdfplumber)
- Text preprocessing (cleaning, normalization)
- Named Entity Recognition (NER) - extract name, email, skills
- Skill extraction from resume text
- Store parsed data in JSONB

### Job Matching
- TF-IDF vectorization of resumes and job descriptions
- Cosine similarity calculation
- Match percentage display
- Top 10 recommendations

### API Endpoints

**Auth API**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/refresh

**Users API**
- GET /api/users (Admin)
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id (Admin)

**Jobs API**
- GET /api/jobs
- GET /api/jobs/:id
- POST /api/jobs (Recruiter/Admin)
- PUT /api/jobs/:id (Owner/Admin)
- DELETE /api/jobs/:id (Owner/Admin)

**Applications API**
- GET /api/applications (User-specific or all for recruiter)
- POST /api/applications
- PUT /api/applications/:id/status (Recruiter)

**Resume API**
- POST /api/resume/upload
- GET /api/resume/:userId
- DELETE /api/resume/:id

**AI Service API**
- POST /ai/parse-resume
- POST /ai/match-jobs
- POST /ai/extract-skills

**Courses API**
- GET /api/courses
- POST /api/courses (Admin)
- PUT /api/courses/:id (Admin)
- DELETE /api/courses/:id (Admin)

---

## 5. Database Schema

### Users Table
```sql
id: UUID PRIMARY KEY
email: VARCHAR(255) UNIQUE
password_hash: VARCHAR(255)
name: VARCHAR(255)
role: ENUM('student', 'recruiter', 'admin')
avatar_url: TEXT
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Resumes Table
```sql
id: UUID PRIMARY KEY
user_id: UUID REFERENCES users(id)
file_url: TEXT
file_name: VARCHAR(255)
parsed_data: JSONB
skills: TEXT[]
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Jobs Table
```sql
id: UUID PRIMARY KEY
title: VARCHAR(255)
company: VARCHAR(255)
description: TEXT
requirements: TEXT
location: VARCHAR(255)
salary_min: INTEGER
salary_max: INTEGER
job_type: ENUM('full-time', 'part-time', 'internship', 'contract')
status: ENUM('active', 'closed')
recruiter_id: UUID REFERENCES users(id)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Applications Table
```sql
id: UUID PRIMARY KEY
job_id: UUID REFERENCES jobs(id)
student_id: UUID REFERENCES users(id)
resume_id: UUID REFERENCES resumes(id)
status: ENUM('pending', 'shortlisted', 'rejected', 'interview')
match_score: FLOAT
cover_letter: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Courses Table
```sql
id: UUID PRIMARY KEY
title: VARCHAR(255)
description: TEXT
instructor: VARCHAR(255)
url: TEXT
thumbnail_url: TEXT
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Saved Jobs Table
```sql
id: UUID PRIMARY KEY
user_id: UUID REFERENCES users(id)
job_id: UUID REFERENCES jobs(id)
created_at: TIMESTAMP
```

---

## 6. Acceptance Criteria

### Authentication
- [ ] Users can register with email, password, name, and role
- [ ] Users can login and receive JWT token
- [ ] Protected routes redirect to login if not authenticated
- [ ] Role-based route protection works correctly

### Student Features
- [ ] Student can upload PDF resume
- [ ] Resume is parsed and skills extracted
- [ ] Student can browse all active jobs
- [ ] Student can apply to jobs
- [ ] Student sees personalized job recommendations
- [ ] Student can save jobs for later
- [ ] Student can track application status

### Recruiter Features
- [ ] Recruiter can create job postings
- [ ] Recruiter can view applicants for their jobs
- [ ] Recruiter can shortlist/reject applicants
- [ ] Recruiter can update job status

### Admin Features
- [ ] Admin can view all users
- [ ] Admin can manage users
- [ ] Admin can view platform statistics

### AI Service
- [ ] PDF resumes are correctly parsed
- [ ] Skills are extracted accurately
- [ ] Job matching returns relevant results
- [ ] Match scores are calculated correctly

### UI/UX
- [ ] All pages are responsive
- [ ] Loading states are shown
- [ ] Error messages are displayed clearly
- [ ] Success feedback is shown after actions
- [ ] Navigation is intuitive

### Build & Deployment
- [ ] Frontend builds without errors
- [ ] Backend builds without errors
- [ ] AI service runs without errors
- [ ] All API endpoints return correct responses

---

## 7. Project Structure

```
esencelab/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── services/       # Business logic
│   │   ├── models/         # Prisma models
│   │   └── utils/          # Utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── ai-service/              # FastAPI AI service
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI processing
│   │   └── utils/          # Utilities
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```
