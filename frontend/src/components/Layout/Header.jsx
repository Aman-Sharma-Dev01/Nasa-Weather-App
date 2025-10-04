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
        <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold tracking-wider hover:text-blue-300 transition">
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
                            <Link to="/login" className="px-3 py-1 text-sm rounded-lg hover:bg-gray-700 transition">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-3 py-1 bg-blue-600 text-sm rounded-lg hover:bg-blue-700 transition shadow-md">
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
