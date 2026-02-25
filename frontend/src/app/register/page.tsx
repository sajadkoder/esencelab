'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!trimmedName || !normalizedEmail || !normalizedPassword) {
      setError('All fields are required.');
      return;
    }

    if (normalizedPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (normalizedPassword !== confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register({ name: trimmedName, email: normalizedEmail, password: normalizedPassword, role });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

            <h1 className="mt-10 font-serif text-4xl leading-tight text-primary">Create your account.</h1>
            <p className="mt-4 text-sm leading-relaxed text-secondary">
              Start building a structured, AI-driven view of resumes, skill gaps, and career readiness.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-secondary">
                <ShieldCheck className="h-4 w-4" /> Secure JWT authentication
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-secondary">
                <Sparkles className="h-4 w-4" /> Personalized career roadmaps
              </div>
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="border border-black/10 bg-white p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-primary">Create account</h2>
          <p className="mt-2 text-sm text-secondary">Fill in the details below to get started.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-secondary">Full Name</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-secondary">Email</label>
              <input
                id="register-email"
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
              <label htmlFor="register-role" className="mb-2 block text-sm font-medium text-secondary">Role</label>
              <select
                id="register-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="student">Student / Job Seeker</option>
                <option value="employer">Recruiter / Employer</option>
              </select>
            </div>

            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-secondary">Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="mb-2 block text-sm font-medium text-secondary">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="********"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-7 text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent transition-colors hover:text-primary">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
