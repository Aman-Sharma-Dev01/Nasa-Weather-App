import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// The context file is in src/context/. The apiService is in src/api/.
// It needs to go up one level (..) to src/, then down into api/.
// CORRECTED PATH: 
import { logoutUser } from '../api/apiService'; 

// 1. Create the Context Object
const AuthContext = createContext();

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check for token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, you would validate the token with a backend call here.
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        logoutUser(); // Clears token from apiService (localStorage)
        setIsAuthenticated(false);
        navigate('/login');
    };

    const value = {
        isAuthenticated,
        loading,
        handleLogin,
        handleLogout,
        setIsAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Loading Authentication...</div> : children}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook to use the Auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
