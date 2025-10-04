import React from 'react';
import { Navigate } from 'react-router-dom';
// Corrected import path: ProtectedRoute is in src/components/UI/. 
// It needs to go up two levels (../../) to src/ and then down into context/
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    // Note: useAuth is defined in context/AuthContext.jsx
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // You would typically show a spinner component here
        return <div className="text-center p-8">Loading...</div>; 
    }

    if (!isAuthenticated) {
        // Redirect unauthenticated users to the login page
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
