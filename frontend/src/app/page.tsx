'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles, ArrowRight, BrainCircuit, Target, TrendingUp,
  Briefcase, Video, FileText, CheckCircle2, ChevronRight,
  ShieldCheck, BarChart3, Users
} from 'lucide-react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';

function GraduationCapLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
      <path d="M22 10v6"></path>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
    </svg>
  );
}

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-ivory bg-background overflow-hidden selection:bg-accent selection:text-white pb-20">
      {/* Cinematic Navigation */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 border-b-[0.5px] border-border bg-white/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/20"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
              <GraduationCapLogo className="w-5 h-5 text-accent" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-primary">EsenceLab</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/login">
              <span className="font-sans font-medium text-secondary hover:text-primary transition-colors text-sm cursor-pointer">
                Sign In
              </span>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-white hover:bg-black/80 font-medium h-9 px-6 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Join Elite
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-40 lg:pt-52 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* Left Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10"
          >
            <motion.div variants={fadeIn} className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-[0.5px] border-accent/30 bg-accent/5 text-accent font-sans font-semibold text-xs uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform 2.0 Released</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary tracking-tight leading-[1.05] mb-8"
            >
              Your Career,<br />
              <span className="italic font-light text-secondary">Engineered by AI.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="font-sans text-lg md:text-xl text-secondary max-w-xl leading-relaxed mb-12 font-light">
              We deconstruct your resume and reconstruct your future. Uncover exact skill gaps, run ultra-realistic mock interviews, and land offers at top-tier firms.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 rounded-full px-10 bg-primary text-white text-base shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform duration-500 font-medium">
                  Scan Your Resume <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#magic-parser">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 rounded-full px-10 text-base border-[0.5px] border-border bg-white/50 hover:bg-white/80 transition-all duration-500 font-medium shadow-sm backdrop-blur-sm">
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Floating Dashboard 3D Effect */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex-1 w-full max-w-2xl relative perspective-1000 hidden lg:block"
          >
            <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full" />
            <div className="glass-panel rounded-[2rem] p-6 transform rotate-y-[-10deg] rotate-x-[5deg] scale-105 border-[0.5px] border-white/60">
              {/* Mock UI Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b-[0.5px] border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-accent/20">A</div>
                  <div>
                    <div className="font-sans font-semibold text-primary text-sm">Alex Chen</div>
                    <div className="font-sans text-xs text-secondary">Target: Senior Frontend</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-serif text-accent">76%</div>
                  <div className="text-[10px] font-sans text-secondary uppercase tracking-wider font-semibold">Match Score</div>
                </div>
              </div>

              {/* Data Rows */}
              <div className="space-y-4">
                <div className="bg-white/50 border-[0.5px] border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-sans text-sm font-medium text-primary">Skill Gap Detected</span>
                  </div>
                  <Badge variant="warning" className="bg-amber-100/50 text-amber-800 border-[0.5px] border-amber-200 uppercase tracking-widest text-[9px]">Critical</Badge>
                </div>
                <div className="bg-white/50 border-[0.5px] border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="font-sans text-sm font-medium text-primary">Top Match: Google</span>
                  </div>
                  <Badge variant="success" className="bg-emerald-100/50 text-emerald-800 border-[0.5px] border-emerald-200 uppercase tracking-widest text-[9px]">92% Match</Badge>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Magic Parser Section */}
      <section id="magic-parser" className="py-32 px-6 mt-20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-6">The Magic Parser</h2>
            <p className="font-sans text-secondary leading-relaxed">
              Drop your PDF. Watch in real-time as our AI extracts, normalizes, and ranks every data point.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center bg-white/40 border-[0.5px] border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 backdrop-blur-xl relative overflow-hidden">
            {/* Left: Document Mock */}
            <div className="flex-1 w-full bg-white rounded-2xl border-[0.5px] border-border shadow-sm p-8 relative h-[400px] overflow-hidden group">
              {/* Laser Line Animation */}
              <motion.div
                animate={{ y: [0, 400, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_rgba(212,175,55,0.8)] z-20"
              />
              <div className="space-y-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
                <div className="h-6 w-1/3 bg-black/10 rounded" />
                <div className="h-3 w-1/4 bg-black/5 rounded" />
                <div className="pt-6 space-y-3">
                  <div className="h-4 w-full bg-black/5 rounded" />
                  <div className="h-4 w-5/6 bg-black/5 rounded" />
                  <div className="h-4 w-4/6 bg-black/5 rounded" />
                </div>
                <div className="pt-6 space-y-3">
                  <div className="h-4 w-full bg-black/5 rounded" />
                  <div className="h-4 w-5/6 bg-black/5 rounded" />
                </div>
              </div>
            </div>

            {/* Right: Extracted Data */}
            <div className="flex-1 w-full space-y-6">
              <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2">
                <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">Detected Skills</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['React.js', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'].map((skill, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={skill}
                      className="px-3 py-1.5 rounded-md border-[0.5px] border-accent/20 bg-accent/5 text-accent font-sans text-xs font-semibold"
                    >
                      {skill}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2">
                <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">Experience Vector</span>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-3xl font-serif text-primary">4.2</div>
                  <div className="font-sans text-sm text-secondary leading-tight">Years quantified<br />experience measured.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
