import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/UI/ProtectedRoute';

// Lazily import page components for code-splitting
const LoginPage = lazy(() => import('./pages/Auth/AuthPages').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/Auth/AuthPages').then(module => ({ default: module.RegisterPage })));
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// A simple loading component to show while pages are being fetched
const LoadingFallback = () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
    </div>
);

const App = () => {
    return (
        <Router>
            <AuthProvider>
                {/* Suspense provides a fallback UI while lazy-loaded components are loading */}
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* Protected Dashboard Route */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        />

                        {/* Root path redirects to the dashboard (ProtectedRoute will handle auth check) */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        {/* Catch-all 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
};

export default App;