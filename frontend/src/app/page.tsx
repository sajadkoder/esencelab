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
    <div className="min-h-screen bg-background overflow-hidden selection:bg-black selection:text-white">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCapLogo className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">EsenceLab</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-primary text-sm h-9 px-4">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="font-medium h-9 px-5 text-sm">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl font-black text-primary tracking-tight mb-6"
            >
              AI-Powered Career Intelligence Platform
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-secondary max-w-2xl leading-relaxed mb-10">
              A college project aimed at bridging the gap between academic learning and industry requirements. Upload your resume to find your skill gaps and practice mock interviews.
            </motion.p>

            <motion.div variants={fadeIn} className="flex gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 bg-background">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section id="features" className="py-24 px-6 border-t border-border bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Platform Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
              <BrainCircuit className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary mb-3">Skill Gap Analysis</h3>
              <p className="text-secondary leading-relaxed text-sm">
                Upload your resume and compare it against industry standards to instantly identify areas for improvement.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
              <Video className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary mb-3">Mock Interviews</h3>
              <p className="text-secondary leading-relaxed text-sm">
                Practice technical and behavioral answering with our AI assistant to gain confidence.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
              <Target className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary mb-3">Targeted Learning</h3>
              <p className="text-secondary leading-relaxed text-sm">
                Receive recommended courses and resources tailored specifically to overcome your skill gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <GraduationCapLogo className="w-4 h-4" />
            <span className="font-semibold text-primary">EsenceLab</span>
          </div>
          <div>Academic Project • 2026</div>
        </div>
      </footer>
    </div>
  );
}
