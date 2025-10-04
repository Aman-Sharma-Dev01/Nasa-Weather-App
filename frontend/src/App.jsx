import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
// Context is in src/context/
import { AuthProvider } from './context/AuthContext';
// ProtectedRoute is in src/components/UI/
import ProtectedRoute from './components/UI/ProtectedRoute'; 

// Import Pages
// AuthPages is in src/pages/Auth/
import { LoginPage, RegisterPage } from './pages/Auth/AuthPages'; 
// DashboardLayout is in src/pages/Dashboard/
import DashboardLayout from './pages/Dashboard/DashboardLayout'; 

const App = () => {
    return (
        // BrowserRouter wraps the entire application
        <Router>
            {/* AuthProvider makes authentication state available everywhere */}
            <AuthProvider>
                <div className="font-sans min-h-screen bg-gray-100">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* Protected Routes: Only accessible if authenticated. */}
                        <Route 
                            path="/dashboard/*" // Use /* to allow nested routes within DashboardLayout
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Default/Root Route: Redirects to login if not authenticated, or dashboard if auth check passes */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        {/* Optional: 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
};

// Simple 404 Placeholder component
const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-6xl font-extrabold text-red-500">404</h1>
            <p className="text-xl text-gray-700 mt-4">Page Not Found</p>
            {/* RouterLink is used for internal navigation */}
            <RouterLink to="/dashboard" className="mt-6 inline-block text-blue-600 hover:text-blue-500 font-medium transition duration-150">
                Go to Dashboard
            </RouterLink>
        </div>
    </div>
);

export default App;
