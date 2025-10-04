import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../api/apiService'; 

const Header = () => {
    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <header 
            // --- MODIFICATIONS FOR GLASSMORPHISM ---
            className="sticky top-0 z-50 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-20 bg-gray-900/30 border-b border-gray-100/10 shadow-lg"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 text-white">
                <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold tracking-wider hover:text-cyan-300 transition-colors duration-300">
                    NASA Clima Cast
                </Link>
                <nav>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-300 hidden sm:inline">User Logged In</span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition shadow-md"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="px-3 py-1 text-sm rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-3 py-1 bg-cyan-600 text-sm rounded-lg hover:bg-cyan-700 transition shadow-md">
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;