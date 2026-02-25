'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import Card from '@/components/Card';

function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );
}

const demoAccounts = [
  { label: 'Student', email: 'student@esencelab.com', password: 'demo123' },
  { label: 'Recruiter', email: 'recruiter@esencelab.com', password: 'demo123' },
  { label: 'Admin', email: 'admin@esencelab.com', password: 'demo123' },
];

const getAuthError = (error: any) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (status === 401) return 'Invalid credentials. Please check your email and password.';
  if (!error?.response) return 'Cannot reach backend API. Start backend on http://localhost:3001.';
  return serverMessage || 'Login failed. Please try again.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const runLogin = async (nextEmail: string, nextPassword: string) => {
    const normalizedEmail = nextEmail.trim().toLowerCase();
    const normalizedPassword = nextPassword.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login({ email: normalizedEmail, password: normalizedPassword });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(getAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await runLogin(email, password);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await runLogin(demoEmail, demoPassword);
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-black/15 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2ef] px-4 py-10 selection:bg-accent selection:text-white sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[0.95fr,1.05fr]"
      >
        <Card hoverable={false} className="relative overflow-hidden border border-black/10 bg-[linear-gradient(180deg,#f7f2e5_0%,#efe6d2_100%)] p-8 md:p-10">
          <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white transition-transform group-hover:scale-105">
                <Logo className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary">Esencelab</span>
            </Link>

            <h1 className="mt-10 font-serif text-4xl leading-tight text-primary">Sign in to continue.</h1>
            <p className="mt-4 text-sm leading-relaxed text-secondary">
              Access your resume intelligence dashboard, skill gap roadmap, and role-based recommendations.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-secondary">
                <ShieldCheck className="h-4 w-4" /> Secure JWT authentication
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-secondary">
                <Sparkles className="h-4 w-4" /> Role-based dashboard routing
              </div>
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="border border-black/10 bg-white p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-primary">Welcome back</h2>
          <p className="mt-2 text-sm text-secondary">Use your credentials or a demo profile.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                disabled={isLoading}
                onClick={() => void handleDemoLogin(account.email, account.password)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-secondary transition hover:bg-black/[0.03] hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {account.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-secondary">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-secondary">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-7 text-sm text-secondary">
            New to Esencelab?{' '}
            <Link href="/register" className="font-medium text-accent transition-colors hover:text-primary">
              Create an account
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
