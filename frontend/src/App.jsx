import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/UI/ProtectedRoute';

// Lazy load other pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPages')); // Single AuthPage for login/register

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p className="text-xl text-gray-600">Loading...</p>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage view="login" />} />
            <Route path="/register" element={<AuthPage view="register" />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
