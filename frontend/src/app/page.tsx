'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Zap, Target, TrendingUp } from 'lucide-react';
import Button from '@/components/Button';

function GraduationCapLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
      <path d="M22 10v6"></path>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
    </svg>
  );
}

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: 'AI Skill Gap Analysis',
      description: 'Upload your resume and get a clear breakdown of current skills and what to improve next.',
    },
    {
      icon: Target,
      title: 'Personalized Learning Paths',
      description: 'Receive curated course recommendations aligned to your target role and current level.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Track your upskilling journey with measurable improvements and role readiness insights.',
    },
  ];

  const benefits = [
    'Skill gap identification from resume data',
    'Course recommendations for each missing skill',
    'Role-readiness score for target job paths',
    'Student-focused dashboard for continuous learning',
    'Placement preparation with practical guidance',
    'Recruiter visibility after upskilling progress',
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="nav-glass fixed top-0 w-full z-50">
        <div className="app-container px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCapLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-black">EsenceLab</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="text-sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="app-container text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Student Upskilling Platform
          </div>
          
          <h1 className="mx-auto max-w-4xl text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6 tracking-tight">
            Build Industry-Ready Skills with{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">AI Guidance</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            EsenceLab helps students identify skill gaps, follow targeted learning paths,
            and become placement-ready through AI-powered recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Start Upskilling <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              How EsenceLab Upskills Students
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              A practical learning workflow from resume analysis to placement readiness
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="surface-card card-hover rounded-2xl p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="app-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Everything You Need for Student Upskilling
            </h2>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
              EsenceLab combines AI analysis and structured learning support
              so students can improve skills before placements.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="app-container max-w-4xl">
          <div className="surface-card rounded-3xl p-10 md:p-14 text-center text-black">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto">
              Join EsenceLab and follow an AI-guided upskilling plan designed for student success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-200">
        <div className="app-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCapLogo className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-black">EsenceLab</span>
            </div>
            <p className="text-sm text-gray-500">(c) 2026 EsenceLab. College Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
