const React = require('react');
const { Routes, Route, Navigate } = require('react-router-dom');

// Layout Components
const MainLayout = require('@/components/layout/MainLayout');

// Pages
const DashboardPage = require('@/pages/Dashboard');
const LoginPage = require('@/pages/auth/Login');
const RegisterPage = require('@/pages/auth/Register');
const RunsPage = require('@/pages/runs/List');
const RunDetailPage = require('@/pages/runs/Detail');
const RunCreatePage = require('@/pages/runs/Create');
const RunEditPage = require('@/pages/runs/Edit');
const ProfilePage = require('@/pages/profile/Profile');
const SettingsPage = require('@/pages/settings/Settings');
const NotFoundPage = require('@/pages/NotFound');

// Context
const { AuthProvider, useAuth } = require('@/context/AuthContext');

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="runs">
            <Route index element={<RunsPage />} />
            <Route path="create" element={<RunCreatePage />} />
            <Route path=":id" element={<RunDetailPage />} />
            <Route path=":id/edit" element={<RunEditPage />} />
          </Route>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

module.exports = App;
