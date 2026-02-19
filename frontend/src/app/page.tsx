'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Briefcase, Users, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Briefcase,
      title: 'Smart Job Matching',
      description: 'AI-powered matching algorithm connects the right candidates with the right opportunities.',
    },
    {
      icon: Users,
      title: 'Resume Screening',
      description: 'Automated resume parsing and skill extraction for efficient candidate evaluation.',
    },
    {
      icon: GraduationCap,
      title: 'Learning Paths',
      description: 'Access courses to upskill and improve your career prospects.',
    },
  ];

  const benefits = [
    'Automated resume parsing with NLP',
    'Skill-based job matching',
    'Real-time application tracking',
    'Role-based dashboards',
    'Interview scheduling',
    'Analytics and insights',
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="font-bold text-xl text-white">E</span>
              </div>
              <span className="font-bold text-2xl text-primary">EsenceLab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
              AI-Powered Resume Screening &{' '}
              <span className="text-secondary">Job Matching</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Streamline your hiring process with intelligent resume parsing, skill matching, 
              and automated candidate recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                Everything You Need to Hire Smarter
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                EsenceLab combines cutting-edge AI technology with intuitive design 
                to transform your recruitment workflow.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary to-blue-700 rounded-2xl p-8 text-white">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">90%</div>
                <div className="text-blue-100 mb-6">Reduction in screening time</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-3xl font-bold">10k+</div>
                    <div className="text-blue-100">Resumes processed</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-blue-100">Companies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of recruiters and candidates using EsenceLab.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg text-white">E</span>
              </div>
              <span className="font-bold text-xl text-white">EsenceLab</span>
            </div>
            <p className="text-sm">© 2024 EsenceLab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
