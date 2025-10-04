import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
            <p className="text-xl text-gray-700 mt-4">Oops! Page Not Found</p>
            <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
            <Link
                to="/dashboard"
                className="mt-6 inline-block bg-indigo-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-indigo-500 transition-colors duration-150"
            >
                Go to Dashboard
            </Link>
        </div>
    </div>
);

export default NotFoundPage;