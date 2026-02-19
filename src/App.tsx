import { lazy, Suspense, useState, type FormEvent, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const StudentDashboard = lazy(() =>
  import('@/pages/StudentDashboard').then((module) => ({ default: module.StudentDashboard })),
);
const RecruiterDashboard = lazy(() =>
  import('@/pages/RecruiterDashboard').then((module) => ({ default: module.RecruiterDashboard })),
);
const AdminDashboard = lazy(() =>
  import('@/pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })),
);

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  if (user.role === 'employer') {
    return <RecruiterDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <Navigate to="/login" replace />;
}

function RoleOnboarding() {
  const { user, setRole, needsRoleSelection } = useAuth();
  const [savingRole, setSavingRole] = useState<UserRole | null>(null);

  if (!needsRoleSelection || !user) {
    return null;
  }

  const chooseRole = async (role: UserRole) => {
    setSavingRole(role);
    try {
      await setRole(role);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to set role');
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-[#222] rounded-xl bg-[#0a0a0a] p-6">
        <h2 className="text-white text-xl font-semibold mb-2">Select your role</h2>
        <p className="text-sm text-gray-400 mb-6">
          Choose your role to unlock role-based dashboard access.
        </p>

        <div className="grid gap-3">
          {([
            { key: 'student', title: 'Student', desc: 'Resume parsing, skill-gap insights, jobs and course recommendations.' },
            { key: 'employer', title: 'Recruiter', desc: 'Post jobs, search candidates by skills, and review match scores.' },
          ] as { key: UserRole; title: string; desc: string }[]).map((roleOption) => (
            <button
              key={roleOption.key}
              onClick={() => chooseRole(roleOption.key)}
              disabled={savingRole !== null}
              className="text-left border border-[#222] rounded-lg px-4 py-3 hover:border-white transition-colors disabled:opacity-60"
            >
              <p className="text-white font-medium">{roleOption.title}</p>
              <p className="text-xs text-gray-400 mt-1">{roleOption.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[220px]">{children}</div>
      <RoleOnboarding />
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [submitting, setSubmitting] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'employer'>('student');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await signIn(signInEmail, signInPassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await signUp({
        name,
        email,
        password,
        role: signupRole,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.pendingVerification) {
        toast.success('Signup created. Verify your email, then sign in.');
        setMode('sign-in');
        setSignInEmail(email);
        return;
      }

      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Esencelab</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6">
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              className={`flex-1 rounded px-3 py-2 text-sm ${mode === 'sign-in' ? 'bg-white text-black' : 'bg-[#111] text-gray-300'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('sign-up')}
              className={`flex-1 rounded px-3 py-2 text-sm ${mode === 'sign-up' ? 'bg-white text-black' : 'bg-[#111] text-gray-300'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'sign-in' ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <input
                type="email"
                value={signInEmail}
                onChange={(event) => setSignInEmail(event.target.value)}
                placeholder="Email"
                required
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <input
                type="password"
                value={signInPassword}
                onChange={(event) => setSignInPassword(event.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black rounded px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                required
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                required
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <div>
                <p className="text-xs text-gray-500 mb-2">Role</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('student')}
                    className={`rounded px-3 py-2 text-xs border ${
                      signupRole === 'student'
                        ? 'bg-white text-black border-white'
                        : 'bg-[#111] text-gray-300 border-[#222]'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('employer')}
                    className={`rounded px-3 py-2 text-xs border ${
                      signupRole === 'employer'
                        ? 'bg-white text-black border-white'
                        : 'bg-[#111] text-gray-300 border-[#222]'
                    }`}
                  >
                    Recruiter
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">Admin accounts are invite-only.</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black rounded px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/jobs"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/courses"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/candidates"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/analytics"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users"
        element={(
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
