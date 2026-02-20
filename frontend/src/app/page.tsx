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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: 'AI Resume Screening',
      description: 'Upload your resume and our AI extracts skills, education, and experience automatically.',
    },
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'Get personalized job recommendations based on your skills and career goals.',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Discover courses to bridge skill gaps and accelerate your career.',
    },
  ];

  const benefits = [
    'Automated resume parsing',
    'AI-powered skill matching',
    'Real-time application tracking',
    'Role-based dashboards',
    'Job recommendations',
    'Easy recruitment process',
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#FFFBF5]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                <GraduationCapLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-black">EsenceLab</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="text-sm border-gray-300 text-black hover:bg-gray-50">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm bg-black hover:bg-gray-800 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Career Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6 tracking-tight">
            Find Your Dream Job with{' '}
            <span className="text-gray-600">AI Intelligence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            EsenceLab uses artificial intelligence to match students with the right opportunities. 
            Upload your resume, get matched, and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                Start Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 border-gray-300 text-black hover:bg-gray-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#FFF8F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              How EsenceLab Works
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Three simple steps to accelerate your career journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
              EsenceLab combines AI technology with an intuitive platform 
              to help students and recruiters connect efficiently.
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black rounded-3xl p-10 md:p-14 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch Your Career?
            </h2>
            <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
              Join EsenceLab today and let AI help you find the perfect job match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-white/10 px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <GraduationCapLogo className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-black">EsenceLab</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 EsenceLab. College Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
