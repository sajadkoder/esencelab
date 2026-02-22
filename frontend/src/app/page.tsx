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
    <div className="min-h-screen bg-background overflow-hidden selection:bg-accent selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-400/10 blur-[120px] pointer-events-none" />

      {/* Modern Sticky Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 border-b border-white/10 bg-white/60 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:bg-accent shadow-lg shadow-black/10">
              <GraduationCapLogo className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-primary">EsenceLab</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Success Stories</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex font-semibold text-primary hover:bg-black/5">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="shadow-lg shadow-accent/20 hover:shadow-accent/40 font-semibold px-6">
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>EsenceLab 2.0 is now live</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-primary tracking-tighter leading-[1.05] mb-8"
            >
              Bridge the gap to your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-600 to-purple-600">dream career.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-secondary max-w-2xl leading-relaxed mb-12">
              The world's most advanced career intelligence platform. Upload your resume,
              instantly discover your skill gaps, and practice with our AI interviewer to become top-1% recruiter ready.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-2xl shadow-accent/30 hover:scale-105 transition-transform duration-300">
                  Join completely free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-white/50 backdrop-blur-sm border-black/10 hover:border-black/20">
                  See how it works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ y: yPos }}
          className="mt-24 max-w-6xl mx-auto relative perspective"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10 h-full pointer-events-none" />
          <div className="w-full h-auto rounded-3xl border border-white/20 bg-white/40 backdrop-blur-3xl shadow-2xl p-4 md:p-8 transform rotateX-12 shadow-black/5">
            {/* Mock Dashboard UI inside the floating card */}
            <div className="w-full bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-64 border-r border-black/5 p-6 space-y-6 hidden md:block">
                <div className="h-8 w-24 bg-black/5 rounded-md mb-8" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-6 w-full bg-black/5 rounded-md" />)}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-10 space-y-8 bg-black/5/50">
                <div className="h-10 w-48 bg-black/10 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-5 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-accent/10" />
                    <div className="h-4 w-1/2 bg-black/5 rounded" />
                    <div className="h-6 w-3/4 bg-black/10 rounded" />
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-5 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10" />
                    <div className="h-4 w-1/2 bg-black/5 rounded" />
                    <div className="h-6 w-3/4 bg-black/10 rounded" />
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-black/5 shadow-sm p-5 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10" />
                    <div className="h-4 w-1/2 bg-black/5 rounded" />
                    <div className="h-6 w-3/4 bg-black/10 rounded" />
                  </div>
                </div>
                <div className="h-64 w-full bg-white rounded-xl border border-black/5 shadow-sm p-6 hidden sm:block">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-black/5" />
                    <div className="space-y-3 flex-1">
                      <div className="h-4 w-1/3 bg-black/10 rounded" />
                      <div className="h-4 w-full bg-black/5 rounded" />
                      <div className="h-4 w-5/6 bg-black/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-32 px-6 relative z-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-6">
              Everything you need to <br /> land the offer.
            </h2>
            <p className="text-xl text-secondary max-w-2xl leading-relaxed">
              We've completely re-engineered the process of job hunting. No more guessing what recruiters want. Our AI tells you exactly what you're missing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">

            {/* Feature 1: Large Box */}
            <div className="md:col-span-2 bg-background border border-border rounded-3xl p-8 md:p-12 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 group overflow-hidden relative">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">AI Skill Gap Analysis</h3>
              <p className="text-secondary text-lg leading-relaxed max-w-md">
                Upload your resume and instantly see how it stacks up against thousands of JD requirements. Get a personalized roadmap to fill in the missing puzzle pieces.
              </p>

              <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[80%] opacity-20 group-hover:opacity-40 transition-opacity duration-500 hidden sm:block">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-accent">
                  <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.4,-46.3C91,-33.5,97.2,-17.9,96.5,-2.9C95.8,12.2,88.1,26.9,78.2,39.9C68.3,52.9,56.2,64.3,42.5,72.4C28.8,80.5,14.4,85.3,-0.6,86.4C-15.6,87.5,-31.2,84.9,-44.6,76.9C-58,68.9,-69.2,55.5,-77.8,40.7C-86.4,25.9,-92.4,9.6,-91.7,-6.1C-91,-21.8,-83.6,-37.1,-73.4,-49.6C-63.2,-62.1,-50.2,-71.9,-36.2,-79.3C-22.2,-86.7,-7.1,-91.7,7,-92.6C21.1,-93.5,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>

            {/* Feature 2: Small Box */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 md:p-10 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 group">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950 mb-3">Mock Interviews</h3>
              <p className="text-emerald-800/80 leading-relaxed">
                Practice with our AI recruiter. Answer real technical questions and get instant feedback on clarity and pace.
              </p>
            </div>

            {/* Feature 3: Small Box */}
            <div className="bg-purple-50 border border-purple-100 rounded-3xl p-8 md:p-10 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 group">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-950 mb-3">Targeted Learning</h3>
              <p className="text-purple-800/80 leading-relaxed">
                Stop wasting time on generic courses. Get specific tutorials for the exact tools recruiters are searching for.
              </p>
            </div>

            {/* Feature 4: Large Box */}
            <div className="md:col-span-2 bg-[#0B0B0B] text-white rounded-3xl p-8 md:p-12 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />

              <div className="relative z-10 w-full h-full flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Intelligent Application Tracking</h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-md">
                    Manage all your job hunts in one pristine dashboard. See application statuses, match scores, and upcoming interviews without opening a single spreadsheet.
                  </p>
                </div>
                <div className="w-full md:w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500" />
                        <div className="text-sm font-medium">Frontend Engineer</div>
                      </div>
                      <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-none">Shortlisted</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500" />
                        <div className="text-sm font-medium">React Developer</div>
                      </div>
                      <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border-none">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-border bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">94%</div>
              <div className="text-sm font-medium text-secondary uppercase tracking-widest">Placement Rate</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">50k+</div>
              <div className="text-sm font-medium text-secondary uppercase tracking-widest">Resumes Analyzed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">12k</div>
              <div className="text-sm font-medium text-secondary uppercase tracking-widest">Success Stories</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">#1</div>
              <div className="text-sm font-medium text-secondary uppercase tracking-widest">Upskilling Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter mb-8 leading-tight">
            Stop guessing. <br /> Start landing offers.
          </h2>
          <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the elite tier of students who use data, not luck, to shape their careers. It takes 60 seconds to see your true potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-lg shadow-2xl shadow-accent/20 hover:scale-105 transition-transform duration-300">
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <GraduationCapLogo className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight">EsenceLab</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-secondary">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">Github</a>
            </div>
            <p className="text-sm text-secondary">© 2026 EsenceLab. Crafted with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
