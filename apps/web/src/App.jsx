import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import MainLayout from '@/components/layout/MainLayout';

// Pages
import DashboardPage from '@/pages/Dashboard';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import RunsPage from '@/pages/runs/List';
import RunDetailPage from '@/pages/runs/Detail';
import RunCreatePage from '@/pages/runs/Form';
import RunEditPage from '@/pages/runs/Form';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFound';

// Context
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
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
            <Route path="new" element={<RunCreatePage />} />
            <Route path=":id" element={<RunDetailPage />} />
            <Route path=":id/edit" element={<RunEditPage isEdit />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

module.exports = App;
