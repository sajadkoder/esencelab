'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Zap, Target, TrendingUp } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B35]"></div>
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg text-white">E</span>
              </div>
              <span className="font-bold text-xl text-[#1a1a1a]">EsenceLab</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="text-sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm bg-[#FF6B35] hover:bg-[#e55a2b]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#FFF5E6] text-[#FF6B35] rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Career Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] leading-tight mb-6 tracking-tight">
            Find Your Dream Job with{' '}
            <span className="text-[#FF6B35]">AI Intelligence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            EsenceLab uses artificial intelligence to match students with the right opportunities. 
            Upload your resume, get matched, and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8">
                Start Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 border-gray-300 hover:bg-gray-50">
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
              How EsenceLab Works
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Three simple steps to accelerate your career journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#FFF5E6] rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                EsenceLab combines AI technology with an intuitive platform 
                to help students and recruiters connect efficiently.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] rounded-2xl p-10 text-white">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">90%</div>
                <div className="text-orange-100 mb-8 text-lg">Faster screening time</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-orange-100 text-sm mt-1">AI Accuracy</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-orange-100 text-sm mt-1">Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-3xl p-10 md:p-14 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch Your Career?
            </h2>
            <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
              Join EsenceLab today and let AI help you find the perfect job match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8">
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
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-7 h-7 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm text-white">E</span>
              </div>
              <span className="font-bold text-lg text-[#1a1a1a]">EsenceLab</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 EsenceLab. College Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
