'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Briefcase, Users, GraduationCap, ArrowRight, CheckCircle, Sparkles, Target, BookOpen } from 'lucide-react';
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
      icon: Sparkles,
      title: 'AI Resume Screening',
      description: 'Upload your resume and our AI automatically extracts skills, education, and experience for accurate matching.',
    },
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'Get personalized job recommendations based on your skills and career goals with AI-powered matching.',
    },
    {
      icon: BookOpen,
      title: 'Course Recommendations',
      description: 'Discover courses to bridge skill gaps and boost your employability with personalized learning paths.',
    },
  ];

  const benefits = [
    'Automated resume parsing with NLP',
    'AI-powered skill matching',
    'Real-time application tracking',
    'Role-based dashboards',
    'Job recommendations for students',
    'Easy recruitment for companies',
  ];

  const stats = [
    { value: '500+', label: 'Students Registered' },
    { value: '50+', label: 'Recruiting Companies' },
    { value: '200+', label: 'Jobs Posted' },
    { value: '1000+', label: 'Applications Processed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-primary">SNGCET</span>
                <span className="font-bold text-xl text-secondary ml-1">CareerHub</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Artificial Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
              AI-Powered Career Platform for{' '}
              <span className="text-secondary">SNGCET Students</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Streamline your career journey with intelligent resume screening, 
              skill-based job matching, and personalized course recommendations — 
              designed specifically for our college placement ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Student Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our AI-powered platform makes career services simple and effective
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                Everything You Need for Career Success
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                SNGCET CareerHub combines cutting-edge AI technology with our college 
                placement ecosystem to help students and recruiters connect efficiently.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">90%</div>
                <div className="text-blue-100">Reduction in screening time</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-blue-100 text-sm">AI Accuracy</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-100 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Boost Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of SNGCET students who have already found their dream jobs 
              through our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  Register Now
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">SNGCET</span>
                <span className="font-bold text-xl text-secondary ml-1">CareerHub</span>
              </div>
            </div>
            <p className="text-sm">© 2024 SNGCET CareerHub. College Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
