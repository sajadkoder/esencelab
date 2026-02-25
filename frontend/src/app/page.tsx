'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Compass,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  WandSparkles,
} from 'lucide-react';

function BrandMark() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1d3557,#2f5f93)] text-xs font-bold text-white">
        E
      </span>
      <span className="text-sm font-semibold tracking-[0.14em]">ESENCELAB</span>
    </div>
  );
}

const navItems = [
  { href: '#objectives', label: 'Objectives' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#results', label: 'Results' },
  { href: '#about', label: 'About' },
];

const projectObjectives: Array<{ title: string; detail: string; icon: LucideIcon }> = [
  {
    title: 'Automate Resume Parsing',
    detail: 'Use NLP techniques to extract and normalize resume content into structured candidate data.',
    icon: Bot,
  },
  {
    title: 'Run Skill-Gap Analysis',
    detail: 'Compute skill similarity with TF-IDF vectors and cosine similarity to identify missing competencies.',
    icon: BarChart3,
  },
  {
    title: 'Generate Job Recommendations',
    detail: 'Deliver personalized role suggestions based on extracted profile signals and readiness fit.',
    icon: Compass,
  },
  {
    title: 'Build Career Roadmaps',
    detail: 'Provide structured improvement plans with prioritized milestones and concrete next actions.',
    icon: WandSparkles,
  },
  {
    title: 'Rank Candidates for Recruiters',
    detail: 'Assist hiring teams with automated ranking and transparent score rationale for better decisions.',
    icon: UsersRound,
  },
  {
    title: 'Reduce Manual Screening Time',
    detail: 'Minimize repetitive review work by auto-processing resumes and surfacing decision-ready insights.',
    icon: ShieldCheck,
  },
  {
    title: 'Scale with Microservices',
    detail: 'Support growth through a scalable microservice-based architecture across parsing, scoring, and matching.',
    icon: Star,
  },
];

const featureCards: Array<{ title: string; detail: string; tag: string; icon: LucideIcon }> = [
  {
    title: 'Resume Structuring AI',
    detail: 'Convert resumes into recruiter-ready records with reliable field extraction and confidence scoring.',
    tag: 'NLP Parsing',
    icon: Bot,
  },
  {
    title: 'Role Fit Scoring',
    detail: 'Benchmark candidate readiness against role requirements with explainable scoring layers.',
    tag: 'Fit Intelligence',
    icon: BarChart3,
  },
  {
    title: 'Guided Upskilling',
    detail: 'Generate step-by-step learning actions that close targeted competency gaps quickly.',
    tag: 'Learning Plan',
    icon: Compass,
  },
  {
    title: 'Recruiter Shortlists',
    detail: 'Rank applicants with transparent rationale so hiring teams can move from review to interview faster.',
    tag: 'Hiring Ops',
    icon: UsersRound,
  },
  {
    title: 'Quality Guardrails',
    detail: 'Built-in validation checks keep profile data clean and reduce manual correction loops.',
    tag: 'Data Quality',
    icon: ShieldCheck,
  },
  {
    title: 'Actionable Insights',
    detail: 'Surface practical next steps for students, mentors, and recruiters from the same intelligence layer.',
    tag: 'Career Growth',
    icon: WandSparkles,
  },
];

const workflowSteps = [
  {
    title: 'Capture',
    detail: 'Upload a resume and instantly normalize profile data into a structured candidate model.',
  },
  {
    title: 'Diagnose',
    detail: 'Evaluate role readiness, detect gaps, and annotate evidence behind each score.',
  },
  {
    title: 'Accelerate',
    detail: 'Launch a targeted roadmap for students and a ranked shortlist for recruiters.',
  },
];

const insightSignals = [
  { label: 'Data integrity', value: 96 },
  { label: 'Role alignment', value: 89 },
  { label: 'Upskilling clarity', value: 92 },
];

const impactMetrics = [
  { value: '3x', label: 'faster recruiter screening cycles' },
  { value: '72%', label: 'less manual profile cleanup' },
  { value: '41%', label: 'higher interview readiness progression' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#112238]/20 border-t-[#0e7ac4]" />
      </div>
    );
  }

  return (
    <div className="velocity-shell relative min-h-screen overflow-x-hidden text-[var(--landing-ink)]">
      <div className="velocity-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="velocity-orb velocity-orb-mint left-[-140px] top-[120px]" />
      <div className="velocity-orb velocity-orb-sky right-[-160px] top-[90px]" />
      <div className="velocity-orb velocity-orb-coral bottom-[180px] right-[12%]" />

      <div className="relative z-20 px-4 pb-14 pt-5 sm:px-6 lg:px-10">
        <header className="mx-auto max-w-[1220px]">
          <div className="sticky top-4 z-40 flex items-center justify-between rounded-full border border-white/70 bg-white/74 px-3 py-2 shadow-[0_16px_32px_-26px_rgba(17,34,56,0.5)] backdrop-blur-xl">
            <Link href="/" className="rounded-full px-2 py-1 transition hover:bg-white/80">
              <BrandMark />
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-[rgba(17,34,56,0.72)] md:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-[var(--landing-ink)]">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full border border-[#112238]/14 bg-white/82 px-4 py-2 text-sm font-semibold transition hover:bg-white md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(145deg,#123560,#0e7ac4)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="mx-auto mt-12 max-w-[1220px]" id="top">
            <div className="grid items-center gap-8 lg:grid-cols-[1.08fr,0.92fr]">
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="velocity-chip">
                  <Sparkles className="h-3.5 w-3.5 text-[#0e7ac4]" />
                  Next-gen Career Intelligence
                </div>
                <h1 className="mt-5 font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Make every resume
                  <br />
                  operational in minutes.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[rgba(17,34,56,0.76)]">
                  Esencelab unifies NLP resume parsing, TF-IDF/cosine skill-gap analysis, and personalized recommendation workflows so students improve faster and recruiters hire with better signal.
                </p>

                <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(145deg,#123560,#0e7ac4)] px-7 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-[#112238]/14 bg-white/78 px-7 py-3 text-sm font-semibold transition hover:bg-white"
                  >
                    Explore dashboard
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[rgba(17,34,56,0.65)]">
                  <span className="velocity-chip normal-case tracking-[0.03em]">TF-IDF + cosine scoring</span>
                  <span className="velocity-chip normal-case tracking-[0.03em]">Personalized job recommendations</span>
                  <span className="velocity-chip normal-case tracking-[0.03em]">Microservice-ready architecture</span>
                </div>
              </motion.div>

              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="velocity-card relative overflow-hidden p-6 sm:p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(132,216,191,0.22),transparent_40%),radial-gradient(circle_at_0%_90%,rgba(158,201,255,0.22),transparent_38%)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(17,34,56,0.62)]">Live profile snapshot</p>
                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Readiness diagnostics</h2>

                  <div className="mt-5 space-y-4">
                    {insightSignals.map((signal, index) => (
                      <div key={signal.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span>{signal.label}</span>
                          <span className="font-semibold text-[#0e7ac4]">{signal.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#dbe6f2]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${signal.value}%` }}
                            transition={{ duration: 0.75, delay: 0.26 + index * 0.11, ease: 'easeOut' }}
                            className="h-full rounded-full bg-[linear-gradient(90deg,#2f5f93,#0e7ac4,#31b48c)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#112238]/10 bg-white/86 p-4">
                    <p className="text-sm text-[rgba(17,34,56,0.74)]">
                      Recommended next role: <span className="font-semibold text-[var(--landing-ink)]">Junior Data Analyst</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#2f5f93]">SQL foundations</span>
                      <span className="rounded-full bg-[#e9f8f2] px-3 py-1 text-xs font-semibold text-[#227f66]">Dashboard storytelling</span>
                      <span className="rounded-full bg-[#fff2e9] px-3 py-1 text-xs font-semibold text-[#a4623c]">Interview practice</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </div>
          </section>

          <section id="objectives" className="mx-auto mt-16 max-w-[1220px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="mb-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(17,34,56,0.6)]">Primary objectives</p>
              <h2 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">Built around your core project goals</h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {projectObjectives.map((objective, index) => (
                <motion.article
                  key={objective.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="velocity-card p-5"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-2.5 py-1 text-xs font-semibold text-[#2f5f93]">
                    <objective.icon className="h-3.5 w-3.5" />
                    Objective {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold">{objective.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(17,34,56,0.75)]">{objective.detail}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="capabilities" className="mx-auto mt-16 max-w-[1220px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="mb-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(17,34,56,0.6)]">Capabilities</p>
              <h2 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">Purpose-built for modern talent pipelines</h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -5 }}
                  className="velocity-card p-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#ecf4ff] px-3 py-1 text-xs font-semibold text-[#2f5f93]">
                    <card.icon className="h-3.5 w-3.5" />
                    {card.tag}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(17,34,56,0.75)]">{card.detail}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="workflow" className="mx-auto mt-16 max-w-[1220px]">
            <div className="velocity-card overflow-hidden p-7 sm:p-9">
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(17,34,56,0.6)]">Workflow</p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">A simple flow from upload to action</h2>
                </div>
                <span className="velocity-chip max-w-fit normal-case tracking-[0.03em]">
                  <Star className="h-3.5 w-3.5 text-[#0e7ac4]" />
                  Designed for students and recruiters
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-2xl border border-[#112238]/10 bg-white/88 p-5"
                  >
                    <div className="mb-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[linear-gradient(145deg,#2f5f93,#0e7ac4)] px-2 text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[rgba(17,34,56,0.74)]">{step.detail}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="results" className="mx-auto mt-16 max-w-[1220px]">
            <div className="grid gap-6 lg:grid-cols-[1.04fr,0.96fr]">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5 }}
                className="velocity-card p-7 sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(17,34,56,0.6)]">Impact</p>
                <h3 className="mt-2 text-3xl font-semibold sm:text-4xl">Outcomes you can measure</h3>
                <div className="mt-5 grid gap-3">
                  {impactMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-[#112238]/10 bg-white/90 p-4">
                      <p className="text-3xl font-semibold text-[#0e7ac4]">{metric.value}</p>
                      <p className="mt-1 text-sm text-[rgba(17,34,56,0.75)]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: 0.06 }}
                className="relative overflow-hidden rounded-3xl bg-[linear-gradient(155deg,#102642,#16508c)] p-7 text-white shadow-[0_26px_54px_-36px_rgba(16,38,66,0.75)] sm:p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(132,216,191,0.25),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(158,201,255,0.22),transparent_40%)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">Customer voice</p>
                  <p className="mt-4 text-lg leading-relaxed text-white/92">
                    &ldquo;Esencelab gave our placement team a single system for student readiness and recruiter collaboration. We moved from resume backlog to interview-ready shortlists in days, not weeks.&rdquo;
                  </p>
                  <div className="mt-5 border-t border-white/20 pt-4">
                    <p className="font-semibold">Career Services Lead</p>
                    <p className="text-sm text-white/70">University Talent Office</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#123560] transition hover:bg-white/90"
                    >
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </motion.article>
            </div>
          </section>
        </main>

        <footer id="about" className="mx-auto mt-16 max-w-[1220px]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_36px_-30px_rgba(17,34,56,0.4)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <BrandMark />
                <p className="mt-2 max-w-md text-sm text-[rgba(17,34,56,0.72)]">
                  AI-powered resume intelligence for role readiness, upskilling, and recruiter decision speed.
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/login" className="text-[rgba(17,34,56,0.72)] transition hover:text-[var(--landing-ink)]">
                  Login
                </Link>
                <Link href="/register" className="text-[rgba(17,34,56,0.72)] transition hover:text-[var(--landing-ink)]">
                  Create account
                </Link>
              </div>
            </div>
            <div className="mt-5 border-t border-[#112238]/10 pt-4 text-xs text-[rgba(17,34,56,0.66)]">
              (c) {year} Esencelab. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
