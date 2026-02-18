# Esencelab - AI-Powered Campus Recruitment Platform

<div align="center">

![Esencelab Logo](https://img.shields.io/badge/Esencelab-Campus%20Recruitment-black?style=for-the-badge)

**A comprehensive campus recruitment platform connecting students with opportunities through AI-powered resume parsing, intelligent job matching, and personalized course recommendations.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google)

[Features](#features) • [Architecture](#architecture) • [Installation](#installation) • [Team](#team)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Team Members](#team-members)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Esencelab is a modern campus recruitment platform designed specifically for Indian students and colleges. It leverages AI to:

- Parse resumes and extract skills automatically
- Match candidates with relevant job opportunities
- Recommend courses to bridge skill gaps
- Provide real-time analytics for administrators

The platform features a Y Combinator-inspired minimalist design with a pure black and white aesthetic, ensuring a clean and professional user experience.

---

## Features

### For Students
| Feature | Description |
|---------|-------------|
| AI Resume Parser | Upload PDF/text resumes and extract skills using ML-based keyword ontology |
| Job Search | Browse jobs from top Indian companies with search and location filters |
| Application Tracking | Track applied jobs with status updates (Applied → Under Review → Interview → Offer) |
| Saved Jobs | Bookmark interesting jobs for later review |
| Course Recommendations | Discover YouTube courses, Indian platforms (GFG, Scaler, Coding Ninjas) |
| Practice Platforms | Links to LeetCode, Codeforces, HackerRank, CodeChef, Striver SDE Sheet |
| Career Chatbot | AI-powered assistant for career guidance using Google Gemini |

### For Recruiters
| Feature | Description |
|---------|-------------|
| Candidate Pipeline | Manage candidates through hiring stages (New → Screening → Interview → Hired) |
| Job Postings | Create and manage job listings |
| Candidate Search | Filter candidates by skills, college, experience |
| Match Scores | View candidate-job compatibility scores |

### For Administrators
| Feature | Description |
|---------|-------------|
| Analytics Dashboard | View platform statistics and trends |
| User Management | Monitor all users, roles, and activities |
| Activity Logs | Track platform activities in real-time |
| Location Analytics | View user distribution across Indian cities |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Vite 7 | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| Radix UI | Accessible Component Primitives |
| Framer Motion | Animations |
| React Router DOM | Routing |
| React Hook Form + Zod | Form Handling & Validation |
| TanStack Query | Server State Management |
| Zustand | Client State Management |
| Lucide React | Icons |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service (PostgreSQL + Auth + Realtime) |
| PostgreSQL | Relational Database |
| Row Level Security | Database Security |

### AI & ML
| Technology | Purpose |
|------------|---------|
| Google Gemini API | Career Chatbot |
| Custom Skill Ontology | Resume Skill Extraction (ML-based keyword matching) |

### Development Tools
| Tool | Purpose |
|------|---------|
| Git & GitHub | Version Control |
| ESLint | Code Linting |
| TypeScript ESLint | TypeScript Linting |
| Vercel | Deployment (Recommended) |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     React Application (Vite)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │  Student   │  │ Recruiter  │  │   Admin    │  │   Auth    │  │   │
│  │  │ Dashboard  │  │ Dashboard  │  │ Dashboard  │  │   Pages   │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            INTEGRATION LAYER                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐│
│  │   Supabase     │  │  Gemini AI     │  │     LocalStorage           ││
│  │  - PostgreSQL  │  │  - Chatbot     │  │  - Auth (Demo Mode)        ││
│  │  - Realtime    │  │  - AI Features │  │  - Saved Jobs/Applications ││
│  └────────────────┘  └────────────────┘  └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── components/
│   ├── layout/           # Layout components
│   │   ├── Header.tsx    # Top navigation with user menu
│   │   └── Sidebar.tsx   # Role-based sidebar navigation
│   ├── profile/          # Profile components
│   │   └── TargetRoleSelector.tsx
│   └── ui/               # 50+ reusable UI components
├── hooks/                # Custom React hooks
│   ├── useAuth.tsx       # Authentication (localStorage-based)
│   ├── useChatbot.ts     # Gemini AI integration
│   ├── useJobs.ts        # Job CRUD (Supabase)
│   ├── useCandidates.ts  # Candidate management
│   └── useCourses.ts     # Course recommendations
├── pages/                # Page components
│   ├── auth/LoginPage.tsx
│   ├── StudentDashboard.tsx
│   ├── RecruiterDashboard.tsx
│   └── AdminDashboard.tsx
├── lib/                  # Core libraries
│   ├── supabase.ts       # Supabase client & types
│   └── constants.ts      # App constants
├── store/                # State management
│   └── appStore.ts       # Zustand store
└── types/                # TypeScript definitions
    └── index.ts
```

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login/     │     │   Validate   │     │   Store in   │
│   Signup     │────▶│   & Create   │────▶│ LocalStorage │
│   Form       │     │   User       │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                           ┌──────────────┐     ┌──────────────┐
                           │   Redirect   │◀────│   Check      │
                           │   to         │     │   Role       │
                           │   Dashboard  │     │              │
                           └──────────────┘     └──────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  profiles   │       │    jobs     │       │ candidates  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◀──────│ employer_id │       │ id (PK)     │
│ email       │       │ title       │       │ user_id (FK)│
│ name        │       │ company     │       │ name        │
│ role        │       │ location    │       │ email       │
│ avatar_url  │       │ skills[]    │       │ skills[]    │
│ created_at  │       │ salary_min  │       │ match_score │
│ updated_at  │       │ salary_max  │       │ status      │
└─────────────┘       │ status      │       └──────┬──────┘
                      └──────┬──────┘              │
                             │                     │
                             ▼                     ▼
                      ┌─────────────────────────────────┐
                      │         applications            │
                      ├─────────────────────────────────┤
                      │ id (PK)                         │
                      │ job_id (FK) ──────────────────┐ │
                      │ candidate_id (FK) ──────────┐ │ │
                      │ status                      │ │ │
                      │ applied_at                  │ │ │
                      └─────────────────────────────┴─┴─┘

┌─────────────┐       ┌─────────────────┐
│   courses   │       │  activity_logs  │
├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)         │
│ title       │       │ user_id (FK)    │
│ provider    │       │ action          │
│ skills[]    │       │ details         │
│ level       │       │ metadata        │
│ rating      │       │ timestamp       │
└─────────────┘       └─────────────────┘
```

### Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User profiles extending Supabase auth | id, email, name, role |
| `jobs` | Job postings by recruiters | title, company, skills[], status |
| `candidates` | Candidate profiles | name, skills[], match_score, status |
| `applications` | Job applications | job_id, candidate_id, status |
| `courses` | Course recommendations | title, provider, skills[], level |
| `activity_logs` | System activity tracking | user_id, action, timestamp |

---

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier)
- Google Gemini API key (optional, for AI features)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/sajadkoder/esencelab.git
cd esencelab

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to SQL Editor
3. Run the contents of `supabase-setup.sql`
4. Get credentials from Settings → API:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI Configuration (Optional - for chatbot)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Getting API Keys

| Service | How to Get |
|---------|-----------|
| Supabase | Dashboard → Settings → API |
| Gemini | [Google AI Studio](https://makersuite.google.com/app/apikey) |

---

## Project Structure

```
esencelab/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Top navigation bar
│   │   │   └── Sidebar.tsx         # Role-based sidebar
│   │   ├── profile/
│   │   │   └── TargetRoleSelector.tsx
│   │   └── ui/                     # 50+ UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useAuth.tsx             # Authentication hook
│   │   ├── useChatbot.ts           # Gemini AI chat
│   │   ├── useJobs.ts              # Job operations
│   │   ├── useCandidates.ts        # Candidate management
│   │   ├── useCourses.ts           # Course data
│   │   ├── useApplications.ts      # Applications
│   │   └── useNotifications.ts     # Notifications
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client & types
│   │   └── constants.ts            # App constants
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── RecruiterDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── store/
│   │   └── appStore.ts             # Zustand store
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── public/
├── supabase-setup.sql              # Database schema
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## API Documentation

### Authentication API (localStorage-based)

```typescript
// Sign Up
signUp(email: string, password: string, name: string, role: UserRole)
// Returns: { error: Error | null }

// Sign In
signIn(email: string, password: string)
// Returns: { error: Error | null }

// Sign Out
signOut()
// Returns: Promise<void>

// Get Current User
useAuth().user
// Returns: AuthUser | null
```

### Supabase Hooks

```typescript
// Jobs
useJobs()           // Fetch all jobs
useJob(id)          // Fetch single job
useCreateJob()      // Create job mutation
useUpdateJob()      // Update job mutation

// Candidates
useCandidates()     // Fetch all candidates
useCandidate(id)    // Fetch single candidate
useUpdateCandidate() // Update candidate mutation

// Courses
useCourses()        // Fetch recommended courses
useCourse(id)       // Fetch single course

// Applications
useApplications()   // Fetch applications
useCreateApplication() // Apply to job
```

---

## Team Members

<div align="center">

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Sajad** | Lead Developer & Project Manager | Architecture, Core Features, Integration |
| **Harikrishnan K** | Frontend & UX Developer | UI Components, Dashboard Design, Animations |
| **Adwaith PC** | Backend & Documentation | Database Design, API Development, Documentation |
| **Jishnu MR** | Testing & Research | QA Testing, Research, Analytics Implementation |

</div>

### Detailed Role Breakdown

#### Sajad - Lead Developer & Project Manager
- System architecture design and implementation
- Core feature development (authentication, job matching)
- Third-party integrations (Supabase, Gemini AI)
- Code review and quality assurance
- Project planning and coordination

#### Harikrishnan K - Frontend & UX Developer
- User interface design and implementation
- Component library development
- Responsive design implementation
- Framer Motion animations
- User experience optimization

#### Adwaith PC - Backend & Documentation
- Database schema design
- Supabase configuration and RLS policies
- API hook development
- Technical documentation
- Deployment configuration

#### Jishnu MR - Testing & Research
- Quality assurance testing
- Feature testing and bug reporting
- Market research for Indian recruitment platforms
- Analytics dashboard implementation
- Performance optimization

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project in Vercel
# 3. Add environment variables
# 4. Deploy
```

### Manual Build

```bash
npm run build
# Serve the 'dist' folder
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [React](https://react.dev) - UI Library
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Google Gemini](https://gemini.google.com) - AI Capabilities
- [Radix UI](https://radix-ui.com) - Accessible Components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

<div align="center">

**Built with ❤️ by Esencelab Team**

[Report Bug](https://github.com/sajadkoder/esencelab/issues) · [Request Feature](https://github.com/sajadkoder/esencelab/issues)

</div>
