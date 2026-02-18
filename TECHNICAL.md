# Technical Documentation - Esencelab

## Project Overview

Esencelab is an AI-powered campus recruitment platform designed for Indian students and colleges. This document provides detailed technical specifications and implementation details for each team member's contributions.

---

## Technology Stack Details

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Core UI library |
| TypeScript | 5.9.3 | Static typing |
| Vite | 7.2.4 | Build tool and dev server |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| Radix UI | Latest | Accessible component primitives |
| Framer Motion | 12.34.0 | Animation library |
| React Router DOM | 7.13.0 | Client-side routing |
| TanStack Query | 5.90.21 | Server state management |
| Zustand | 5.0.11 | Client state management |
| React Hook Form | 7.70.0 | Form handling |
| Zod | 4.3.5 | Schema validation |
| Lucide React | 0.562.0 | Icon library |

### Backend Stack
| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Relational database |
| Supabase Auth | Authentication (via triggers) |
| Row Level Security | Database-level authorization |
| Supabase Realtime | Real-time subscriptions |

### AI & ML Integration
| Technology | Purpose |
|------------|---------|
| Google Gemini API | Career chatbot AI |
| Custom Skill Ontology | Resume skill extraction |

---

## Team Member Technical Responsibilities

---

### 1. Sajad - Lead Developer & Project Manager

#### Technical Responsibilities

##### System Architecture
- Designed and implemented the overall application architecture
- Established the React + TypeScript + Vite project structure
- Configured Supabase integration and database schema design
- Implemented role-based routing and authentication flow

##### Core Feature Implementation

**Authentication System (`src/hooks/useAuth.tsx`)**
```typescript
// LocalStorage-based authentication for demo mode
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

// Key functions implemented:
- signIn(email, password): Promise<{ error: Error | null }>
- signUp(email, password, name, role): Promise<{ error: Error | null }>
- signOut(): Promise<void>
- updateProfile(updates): Promise<{ error: Error | null }>
```

**AI Integration (`src/hooks/useChatbot.ts`)**
```typescript
// Gemini AI integration for career assistance
export function useCareerChatbot() {
  // State management for chat messages
  // Gemini API integration
  // Message persistence
}
```

**Job Matching Algorithm**
- Implemented skill-based matching using keyword ontology
- Match score calculation based on skill overlap
- Course recommendation based on skill gaps

##### Files Created/Modified
| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application routing |
| `src/hooks/useAuth.tsx` | Authentication logic |
| `src/hooks/useChatbot.ts` | AI chatbot integration |
| `src/lib/supabase.ts` | Supabase client and types |
| `supabase-setup.sql` | Complete database schema |

---

### 2. Harikrishnan K - Frontend & UX Developer

#### Technical Responsibilities

##### UI Component Development
- Developed 50+ reusable UI components using Radix UI primitives
- Implemented Y Combinator-inspired black/white design system
- Created responsive layouts for all screen sizes

##### Dashboard Implementations

**Student Dashboard (`src/pages/StudentDashboard.tsx`)**
- AI Resume Parser with drag-and-drop upload
- Job search with filters (search, location)
- Application tracking with status updates
- Saved jobs functionality
- Course recommendations (YouTube, Indian platforms, books)
- Career chatbot integration

**Key Features Implemented:**
```typescript
// Resume parsing with ML-based skill extraction
const SKILL_ONTOLOGY: Record<string, string[]> = {
  'Python': ['python', 'py', 'pandas', 'numpy', 'django', 'flask'],
  'JavaScript': ['javascript', 'js', 'es6', 'nodejs', 'node', 'express'],
  'React': ['react', 'reactjs', 'jsx', 'nextjs', 'next'],
  // ... 15+ skill categories
};

// Application tracking with localStorage persistence
interface AppliedJob {
  id: string;
  title: string;
  company: string;
  status: 'applied' | 'under_review' | 'interview' | 'offer' | 'rejected';
}
```

**Recruiter Dashboard (`src/pages/RecruiterDashboard.tsx`)**
- Candidate pipeline management
- Status-based filtering (New → Screening → Interview → Hired)
- Candidate cards with match scores

**Admin Dashboard (`src/pages/AdminDashboard.tsx`)**
- Platform analytics and statistics
- User management interface
- Location-based analytics for Indian cities

##### Animation System
```typescript
// Framer Motion animations for smooth transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

##### Files Created/Modified
| File | Purpose |
|------|---------|
| `src/pages/StudentDashboard.tsx` | Student dashboard UI |
| `src/pages/RecruiterDashboard.tsx` | Recruiter dashboard UI |
| `src/pages/AdminDashboard.tsx` | Admin dashboard UI |
| `src/pages/auth/LoginPage.tsx` | Authentication UI |
| `src/components/layout/Header.tsx` | Top navigation |
| `src/components/layout/Sidebar.tsx` | Sidebar navigation |
| `src/components/ui/*` | 50+ UI components |
| `src/index.css` | Global styles and YC theme |

---

### 3. Adwaith PC - Backend & Documentation

#### Technical Responsibilities

##### Database Design

**Schema Design (`supabase-setup.sql`)**
```sql
-- Enum types for type safety
CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'hired', 'rejected');

-- Row Level Security policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs 
  FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs" ON public.jobs 
  FOR INSERT WITH CHECK (auth.uid() = employer_id);
```

**Tables Created:**
| Table | Columns | Purpose |
|-------|---------|---------|
| profiles | id, email, name, role, avatar_url | User profiles |
| jobs | id, employer_id, title, company, skills[], status | Job postings |
| candidates | id, name, email, skills[], match_score, status | Candidate profiles |
| applications | id, job_id, candidate_id, status | Job applications |
| courses | id, title, provider, skills[], level, rating | Course catalog |
| activity_logs | id, user_id, action, details, timestamp | Activity tracking |

##### API Hook Development

**Jobs API (`src/hooks/useJobs.ts`)**
```typescript
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });
}
```

**Candidates API (`src/hooks/useCandidates.ts`)**
- Full CRUD operations
- Search and filter functionality
- Status update mutations

##### Documentation
- README.md - Complete project documentation
- API documentation
- Database schema documentation
- Deployment guides

##### Files Created/Modified
| File | Purpose |
|------|---------|
| `supabase-setup.sql` | Complete database setup |
| `src/hooks/useJobs.ts` | Jobs API hooks |
| `src/hooks/useCandidates.ts` | Candidates API hooks |
| `src/hooks/useCourses.ts` | Courses API hooks |
| `src/hooks/useApplications.ts` | Applications API hooks |
| `README.md` | Project documentation |

---

### 4. Jishnu MR - Testing, Research & Analytics

#### Technical Responsibilities

##### Quality Assurance Testing

**Test Scenarios Covered:**
| Feature | Test Cases |
|---------|------------|
| Authentication | Login, Signup, Logout, Role-based access |
| Job Search | Search queries, Location filters, Results display |
| Applications | Apply flow, Status tracking, Persistence |
| Resume Parser | File upload, Skill extraction, Error handling |
| Chatbot | Message sending, AI responses, Error states |

**Browser Testing:**
- Chrome, Firefox, Safari, Edge
- Mobile responsiveness (iOS Safari, Chrome Mobile)

##### Research & Analytics

**Market Research Implemented:**
- Indian job market salary ranges (LPA format)
- Top Indian colleges integration (IITs, NITs, BITS, IIITs)
- Indian job platforms (GFG, Scaler, Coding Ninjas, iNeuron)
- Practice platforms (LeetCode, Codeforces, HackerRank, CodeChef)

**Analytics Dashboard (`src/pages/AdminDashboard.tsx`)**
```typescript
// Statistics implementation
const STATS: Stats = {
  totalUsers: 1250,
  students: 1100,
  recruiters: 150,
  jobs: 85,
  applications: 3450,
  courses: 42,
};

// Top colleges analytics
const TOP_COLLEGES = [
  { name: 'IIT Bombay', users: 120 },
  { name: 'IIT Delhi', users: 98 },
  { name: 'NIT Trichy', users: 85 },
  // ...
];

// Location analytics for Indian cities
const TOP_LOCATIONS = [
  { name: 'Bangalore', count: 450 },
  { name: 'Delhi NCR', count: 320 },
  // ...
];
```

##### Performance Optimization
- Component lazy loading recommendations
- Bundle size optimization suggestions
- Image optimization guidelines

##### Files Created/Modified
| File | Purpose |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Analytics implementation |
| `src/types/index.ts` | Type definitions and sample data |
| Test documentation | QA test cases and reports |

---

## Data Flow Architecture

### Resume Parsing Flow
```
User Uploads Resume (PDF/TXT)
        │
        ▼
┌─────────────────────┐
│  FileReader API     │
│  Extract Text       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  SKILL_ONTOLOGY     │
│  Keyword Matching   │
│  (15+ categories)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  ResumeData Object  │
│  - extractedSkills  │
│  - education[]      │
│  - experience[]     │
└─────────────────────┘
```

### Job Matching Flow
```
Candidate Skills: [Python, React, SQL]
                │
                ▼
┌─────────────────────────────────┐
│     Job Requirements Match      │
│  Job: "SDE I"                   │
│  Required: [Python, DSA, AWS]   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│    Match Score Calculation      │
│    matched = [Python]           │
│    missing = [DSA, AWS]         │
│    score = 1/3 * 100 = 33%      │
└─────────────────────────────────┘
```

### Application Status Flow
```
┌────────┐   ┌───────────┐   ┌───────────┐   ┌────────┐   ┌──────────┐
│ Applied│──▶│Under Review│──▶│ Interview │──▶│ Offer  │   │ Rejected │
└────────┘   └───────────┘   └───────────┘   └────────┘   └──────────┘
    │              │               │              │            │
    └──────────────┴───────────────┴──────────────┴────────────┘
                              │
                              ▼
                    localStorage persistence
```

---

## Security Implementation

### Authentication Security
- Password hashing (stored securely in localStorage for demo)
- Session management via localStorage
- Role-based access control (RBAC)

### Database Security (Supabase)
```sql
-- Row Level Security enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### API Security
- Supabase anon key (public, safe for frontend)
- RLS policies enforce data access rules
- No sensitive data exposed to client

---

## Performance Metrics

### Bundle Size (Production Build)
| Asset | Size | Gzipped |
|-------|------|---------|
| index.js | 554 KB | 166 KB |
| index.css | 82 KB | 14 KB |

### Lighthouse Scores (Target)
| Metric | Score |
|--------|-------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 100 |
| SEO | 90+ |

---

## Future Enhancements

### Planned Features
1. **Real-time Notifications** - Supabase Realtime integration
2. **Email Notifications** - Application status updates
3. **Video Interviews** - Integrated video calling
4. **Advanced Analytics** - ML-based insights
5. **Mobile App** - React Native version

### Technical Debt
1. Migrate to Supabase Auth from localStorage
2. Implement server-side rendering (Next.js migration)
3. Add comprehensive test suite
4. Implement CI/CD pipeline

---

## Deployment Checklist

- [x] Environment variables configured
- [x] Database tables created
- [x] RLS policies enabled
- [x] Sample data seeded
- [x] Production build tested
- [ ] Domain configured
- [ ] SSL certificate
- [ ] Monitoring setup

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Authors:** Esencelab Team
