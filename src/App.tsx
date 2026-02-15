import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoginPage } from '@/pages/auth/LoginPage';
import { StudentDashboard } from '@/pages/StudentDashboard';
import { RecruiterDashboard } from '@/pages/RecruiterDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'employer':
      return <RecruiterDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Sidebar />
                <div className="lg:ml-[280px]">
                  <DashboardRouter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
