# Esencelab Master Build Spec

## Product Goal
Esencelab is a role-based career intelligence platform that combines resume parsing, skill-gap analysis, job matching, roadmap generation, interview prep, recruiter ranking, and admin monitoring.

## Core Roles
- Student
- Recruiter
- Admin

## Functional Scope

### 1. Core System
- Multi-role registration/login
- JWT auth + bcrypt hashing
- Role-based route protection
- Secure logout
- Profile update
- Optional password reset flow

### 2. Student Module
- Resume upload (PDF only, drag/drop, progress, replace)
- Resume parsing pipeline (PDF extraction, NLP parsing, structured JSON)
- Resume strength scoring (overall + section-wise)
- Skill-gap analysis (TF-IDF + cosine similarity)
- Job recommendation engine (top ranked jobs by match)
- Skill roadmap generation (beginner/intermediate/advanced progression)
- 30/60 day learning plan generation
- Mock interview assistant
- Application tracker
- Progress analytics dashboard

### 3. Recruiter Module
- Recruiter auth + role protection
- Job posting CRUD
- Candidate ranking by similarity/match score
- Candidate profile detail view

### 4. Admin Module
- User management (view/disable/delete)
- Job management (add/edit/delete)
- Monitoring dashboard metrics

### 5. AI Module
- Resume pipeline with NLP + normalized skill extraction
- TF-IDF vectorization + cosine similarity scoring
- Human-readable match output (never expose raw similarity values)

### 6. Data Model (Minimum)
- users
- resumes
- jobs
- applications
- learning_plans

### 7. UX Rules
- Minimal, human-readable interface
- Smooth transitions (250ms target)
- Clear role-based dashboard priorities

### 8. Security & Quality
- JWT validation per protected request
- Password hashing and secure auth checks
- Input validation and defensive parsing
- CORS + env-var configuration
- SQL injection-safe DB patterns

### 9. Non-Functional
- Responsive UI
- Scalable microservice-based architecture
- Modular, maintainable code
- Performance-aware API behavior

### 10. Future Extensions
- GitHub profile analysis
- Resume rewriting AI
- Career chatbot
- Live job scraping
- Notifications
- Subscriptions
- Multi-language support
