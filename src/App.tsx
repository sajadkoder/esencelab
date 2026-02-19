import { lazy, Suspense, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-[#222] rounded-xl bg-[#0a0a0a] p-6">
        <h2 className="text-white text-xl font-semibold mb-2">Select your role</h2>
        <p className="text-sm text-gray-400 mb-6">
          Role selection enables role-based dashboard access, API authorization, and database RLS policies.
        </p>

        <div className="grid gap-3">
          {([
            { key: 'student', title: 'Student', desc: 'Resume parsing, skill-gap insights, jobs and course recommendations.' },
            { key: 'employer', title: 'Recruiter', desc: 'Post jobs, search candidates by skills, and review match scores.' },
            { key: 'admin', title: 'Admin', desc: 'Manage users, jobs, courses, reports, and platform analytics.' },
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

function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [signupRole, setSignupRole] = useState<UserRole>('student');

  const signUpMetadata = useMemo(() => ({ role: signupRole }), [signupRole]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Esencelab</h1>
          <p className="text-gray-400">AI-Powered Campus Recruitment Platform</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6">
          {mode === 'sign-in' ? (
            <>
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-gray-400',
                    formFieldLabel: 'text-white',
                    formFieldInput: 'bg-[#111] border-[#222] text-white',
                    formButtonPrimary: 'bg-white text-black hover:bg-gray-200',
                    footerActionLink: 'text-white',
                    dividerLine: 'bg-[#222]',
                    dividerText: 'text-gray-500',
                    socialButtonsBlockButton: 'bg-[#111] border-[#222] text-white',
                    socialButtonsBlockButtonText: 'text-white',
                  },
                }}
              />
              <p className="text-center text-gray-400 text-sm mt-4">
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('sign-up')} className="text-white hover:underline">
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Choose account role</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'student', label: 'Student' },
                    { value: 'employer', label: 'Recruiter' },
                    { value: 'admin', label: 'Admin' },
                  ] as { value: UserRole; label: string }[]).map((roleOption) => (
                    <button
                      key={roleOption.value}
                      onClick={() => setSignupRole(roleOption.value)}
                      className={`text-xs rounded border px-2 py-2 ${
                        signupRole === roleOption.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#111] text-gray-300 border-[#222] hover:border-[#444]'
                      }`}
                    >
                      {roleOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <SignUp
                routing="hash"
                unsafeMetadata={signUpMetadata as unknown as Record<string, unknown>}
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-gray-400',
                    formFieldLabel: 'text-white',
                    formFieldInput: 'bg-[#111] border-[#222] text-white',
                    formButtonPrimary: 'bg-white text-black hover:bg-gray-200',
                    footerActionLink: 'text-white',
                    dividerLine: 'bg-[#222]',
                    dividerText: 'text-gray-500',
                  },
                }}
              />
              <p className="text-center text-gray-400 text-sm mt-4">
                Already have an account?{' '}
                <button onClick={() => setMode('sign-in')} className="text-white hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={(
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            )}
          />
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
