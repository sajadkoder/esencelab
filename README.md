# Esencelab - Campus Recruitment Platform

A modern, AI-powered campus recruitment platform built with React, Supabase, and Gemini AI. Connect students with job opportunities through intelligent resume parsing and job matching.

![Esencelab](https://img.shields.io/badge/Esencelab-Campus%20Recruitment-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Supabase Setup](#supabase-setup)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [Deployment](#deployment)
9. [API Integration](#api-integration)
10. [Features Breakdown](#features-breakdown)
11. [Contributing](#contributing)
12. [License](#license)

---

## Features

### For Students
- **AI Resume Parsing**: Upload resumes and let Gemini AI extract skills, education, and experience
- **Job Matching**: Get personalized job recommendations based on your skills
- **Course Recommendations**: Discover courses to bridge skill gaps
- **Application Tracking**: Track your job applications in one place

### For Recruiters
- **Job Posting**: Post and manage job openings
- **Candidate Search**: Browse and filter candidates by skills
- **Hiring Pipeline**: Manage candidates through stages (new → screening → interview → hired)
- **Match Scores**: View candidate-job compatibility scores

### For Admins
- **Analytics Dashboard**: View system statistics and trends
- **User Management**: Monitor all users and activities
- **Activity Logs**: Track all platform activities in real-time

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **UI Components** | Radix UI, Tailwind CSS, Framer Motion |
| **State Management** | Zustand, TanStack Query |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **AI** | Google Gemini API |
| **Routing** | React Router DOM |
| **Forms** | React Hook Form, Zod |
| **Icons** | Lucide React |

---

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Router (Routes)                   │    │
│  │  / → Login    /dashboard → Role-based Dashboard     │    │
│  │  /jobs → Jobs  /profile → Student Profile           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Layout    │  │   Pages     │  │    UI      │        │
│  │  - Header │  │  - Student  │  │  - Buttons │        │
│  │  - Sidebar │  │  - Recruiter│  │  - Cards   │        │
│  │  - Footer  │  │  - Admin    │  │  - Forms   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Zustand   │  │   TanStack  │  │   Hooks     │        │
│  │  (UI State)│  │   Query     │  │  - useAuth  │        │
│  │             │  │  (Server)   │  │  - useJobs  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Integration Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Supabase  │  │   Gemini    │  │   Storage  │        │
│  │  (Database)│  │   (AI)      │  │  (Resumes) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Core Tables
profiles       -- User profiles (extends auth.users)
jobs           -- Job postings
candidates     -- Candidate information
applications   -- Job applications
courses        -- Course recommendations
activity_logs  -- System activity tracking
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** (free tier works)
- **Google Gemini API key** (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sajadkoder/esencelab.git
cd esencelab
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: esencelab
   - **Database Password**: (remember this)
   - **Region**: Choose closest to you

### Step 2: Run the Setup SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Click **Run** to execute

The SQL script will:
- Create all necessary tables
- Set up enum types
- Enable real-time subscriptions
- Configure Row Level Security (RLS) policies
- Insert sample data (jobs, courses, candidates)
- Create auto-profile creation trigger

### Step 3: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy the **Project URL** (for `VITE_SUPABASE_URL`)
3. Copy the **anon public** key (for `VITE_SUPABASE_ANON_KEY`)

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to your environment variables

---

## Project Structure

```
esencelab/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx   # Main header
│   │   │   └── Sidebar.tsx  # Navigation sidebar
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Glass.tsx    # Glassmorphism components
│   │   │   ├── Button.tsx   # Button variants
│   │   │   ├── Card.tsx     # Card component
│   │   │   └── ...          # 50+ more UI components
│   │   └── AuthModal.tsx    # Authentication modal
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication hook
│   │   ├── useJobs.ts      # Job CRUD operations
│   │   ├── useCandidates.ts # Candidate management
│   │   ├── useCourses.ts   # Course data
│   │   ├── useApplications.ts # Applications
│   │   ├── useActivity.ts  # Activity logs
│   │   └── useRealtime.ts  # Real-time subscriptions
│   │
│   ├── lib/                 # Core libraries
│   │   ├── supabase.ts    # Supabase client
│   │   ├── queryClient.ts  # React Query setup
│   │   ├── gemini.ts       # Gemini AI integration
│   │   └── utils.ts       # Utility functions
│   │
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── RecruiterDashboard.tsx
│   │   └── AdminDashboard.tsx
│   │
│   ├── store/              # State management
│   │   └── appStore.ts    # Zustand store
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx            # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── public/                 # Static assets
├── supabase-setup.sql     # Database setup script
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Deployment

### Deploying to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel project settings, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

Your app will be live at `https://your-project.vercel.app`

### Alternative: Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

---

## API Integration

### Supabase Client

The Supabase client is configured in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Gemini AI Integration

Resume parsing is handled in `src/lib/gemini.ts`:

```typescript
import { parseResumeWithGemini } from '@/lib/gemini'

// Usage
const parsed = await parseResumeWithGemini(resumeText)
// Returns: { skills, education, experience, summary }
```

---

## Features Breakdown

### Authentication Flow

1. User opens the app
2. If not authenticated → Redirect to Login
3. User signs up/signs in
4. Profile created in `profiles` table
5. User redirected to role-based dashboard

### Job Matching Algorithm

1. Student uploads resume
2. Gemini AI extracts skills
3. Skills stored in candidate profile
4. Job matching uses skill overlap:
   ```
   matchScore = (matchingSkills / totalRequiredSkills) * 100
   ```

### Real-time Updates

Supabase Realtime enables:
- Live candidate status changes
- New job notifications
- Activity feed updates

```typescript
// Example: Listening to job changes
supabase
  .channel('jobs')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, 
    (payload) => console.log(payload)
  )
  .subscribe()
```

### UI Components

The app uses a glassmorphism design system:

```typescript
// Glass Card Component
<GlassCard className="p-6">
  <h2>Content</h2>
</GlassCard>

// Gradient Text
<p className="gradient-text">Hello World</p>

// Animated Stat Card
<StatCard 
  label="Total Users" 
  value={150} 
  icon={Users} 
  color="indigo" 
/>
```

---

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## License

This project is licensed under the MIT License.

---

## Support

If you encounter any issues:

1. Check the [Issues](https://github.com/sajadkoder/esencelab/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

---

## Acknowledgments

- [React](https://react.dev) - UI library
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Google Gemini](https://gemini.google.com) - AI capabilities
- [Radix UI](https://radix-ui.com) - Accessible components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev) - Icons

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

**Built with ❤️ by Esencelab Team**
