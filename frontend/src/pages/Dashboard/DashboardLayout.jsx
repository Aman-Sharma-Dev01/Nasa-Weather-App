import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardProvider } from '../../context/DashboardContext';

import QueryForm from './QueryForm';
import SavedDashboards from './SavedDashboards';
import ResultsPage from '../ResultsPage';
import Header from '../../components/Layout/Header';

// Icon for the close button
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [showSavedDashboards, setShowSavedDashboards] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    }, [isAuthenticated, navigate]);

    // Close popup when navigating
    useEffect(() => {
        setShowSavedDashboards(false);
    }, [location.pathname]);


    const currentPath = location.pathname;

    return (
        <DashboardProvider>
            <div className="min-h-screen flex flex-col bg-[#060B28] text-gray-100 font-inter">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-grow container mx-auto px-6 lg:px-12 py-8">
                    <div className="w-full">
                        {/* Dashboard Main Area */}
                        <section className="bg-[#0B113A] rounded-2xl border border-[#1E2A78] shadow-[0_0_25px_rgba(0,0,0,0.6)] overflow-hidden">
                            {/* Sub Navigation */}
                            <div className="border-b border-[#1E2A78] bg-[#0D1448] px-6 py-3 flex items-center justify-between flex-wrap">
                                <nav className="flex space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                                    <Link
                                        to="/dashboard"
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPath === '/dashboard'
                                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/40'
                                                : 'text-gray-300 hover:text-cyan-400 hover:bg-[#1A2260]'
                                        }`}
                                    >
                                        🛰️ Dashboard
                                    </Link>
                                    <Link
                                        to="/dashboard/results"
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPath.startsWith('/dashboard/results')
                                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/40'
                                                : 'text-gray-300 hover:text-cyan-400 hover:bg-[#1A2260]'
                                        }`}
                                    >
                                        📊 Results
                                    </Link>
                                </nav>

                                <div className="flex space-x-3">
                                   <button
                                        onClick={() => setShowSavedDashboards(true)}
                                        className="bg-[#16205F] hover:bg-cyan-700 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium text-white border border-cyan-500 shadow-md shadow-cyan-500/20"
                                    >
                                        View Saved
                                    </button>
                                    <button className="bg-cyan-600 hover:bg-cyan-500 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md shadow-cyan-500/40">
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Page Content */}
                            <div className="p-6 md:p-8 bg-[#0B113A]">
                                <Routes>
                                    <Route index element={<QueryForm />} />
                                    <Route path="results" element={<ResultsPage />} />
                                    <Route path="*" element={<QueryForm />} />
                                </Routes>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-[#0B113A] border-t border-[#1E2A78] py-4 text-center text-sm text-gray-400">
                    © 2025 <span className="text-cyan-400 font-semibold">Celestial Weather</span> — Powered by NASA & GES DISC APIs
                </footer>
            </div>

            {/* Saved Dashboards Popup/Modal */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                    showSavedDashboards ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowSavedDashboards(false)}
                />

                {/* Modal Content */}
                <div
                    className={`relative w-11/12 max-w-md transform transition-all duration-300 ease-out ${
                        showSavedDashboards ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                >
                    <aside className="bg-[#0B113A] rounded-2xl border border-[#1E2A78] shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b border-[#1E2A78] pb-2">
                             <h3 className="text-xl font-semibold text-cyan-400">
                                Saved Dashboards
                            </h3>
                            <button
                                onClick={() => setShowSavedDashboards(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                               <CloseIcon />
                            </button>
                        </div>
                        <SavedDashboards />
                    </aside>
                </div>
            </div>
        </DashboardProvider>
    );
};

export default DashboardLayout;
