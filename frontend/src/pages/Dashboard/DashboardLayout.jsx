import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardProvider } from '../../context/DashboardContext'; 

// Nested Dashboard Components
import QueryForm from './QueryForm';
import SavedDashboards from './SavedDashboards';
import ResultsPage from '../ResultsPage';
import Header from '../../components/Layout/Header';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, handleLogout } = useAuth(); // isAuthenticated not strictly needed here if protected route works

    // Ensure user is logged in (though ProtectedRoute handles the initial check)
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Handle the visual switching between the query and saved views
    const path = window.location.pathname;

    return (
        <DashboardProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Global Header */}
                <Header />

                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* --- Sidebar / Saved Dashboards (Col 1) --- */}
                        <div className="lg:col-span-1">
                            <SavedDashboards />
                        </div>

                        {/* --- Main Content Area (Cols 2-4) --- */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
                                
                                {/* Secondary Navigation for Dashboard Views */}
                                <div className="mb-8 border-b border-gray-200">
                                    <nav className="flex space-x-4">
                                        <Link
                                            to="/dashboard"
                                            className={`py-2 px-4 rounded-t-lg text-sm font-medium transition duration-150 ${
                                                path === '/dashboard' ? 'bg-indigo-50 border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            New Query
                                        </Link>
                                        <Link
                                            to="/dashboard/results"
                                            className={`py-2 px-4 rounded-t-lg text-sm font-medium transition duration-150 ${
                                                path.startsWith('/dashboard/results') ? 'bg-indigo-50 border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            Last Results
                                        </Link>
                                    </nav>
                                </div>

                                {/* Nested Routes for Main Content */}
                                <Routes>
                                    {/* Default dashboard view */}
                                    <Route index element={<QueryForm />} />
                                    
                                    {/* Results view */}
                                    <Route path="results" element={<ResultsPage />} />
                                    
                                    {/* Note: The main /dashboard path is handled here */}
                                    <Route path="*" element={<QueryForm />} />
                                </Routes>

                            </div>
                        </div>
                    </div>
                </main>

                {/* Optional Footer */}
                <footer className="p-4 bg-gray-200 text-center text-gray-600 text-sm">
                    © 2025 NASA Earth Observation Dashboard. Data provided by NASA GES DISC and affiliated partners.
                </footer>
            </div>
        </DashboardProvider>
    );
};

export default DashboardLayout;
