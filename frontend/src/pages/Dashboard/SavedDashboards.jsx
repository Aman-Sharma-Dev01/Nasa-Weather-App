import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { deleteDashboard } from '../../api/apiService';

const SavedDashboards = () => {
    const { 
        savedDashboards, 
        fetchSavedDashboards, 
        loadingDashboards, 
        dashboardError, 
        setCurrentQuery,
        setQueryResults 
    } = useDashboard();
    
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null); // State for custom confirmation: { id, name }

    useEffect(() => {
        // Fetch dashboards if the list is empty upon mounting
        if (!savedDashboards.length && !loadingDashboards) {
            fetchSavedDashboards();
        }
    }, [savedDashboards.length, loadingDashboards, fetchSavedDashboards]);

    // Helper to format the list of variables for display
    const formatVariables = (vars) => 
        vars.map(v => v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ')).join(', ');
    
    // Helper to safely format location details (FIX for TypeError)
    const formatLocationDetails = (locationType, details) => {
        if (!details) return `${locationType}: Unknown`;
        
        const lat = details.lat;
        const lon = details.lon;

        if (typeof lat === 'number' && typeof lon === 'number') {
            return `${locationType}: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
        }
        
        // Handle case where location might be a city name stored in a different field
        if (details.city) {
            return `${locationType}: ${details.city}`;
        }

        return `${locationType}: Invalid Coordinates`;
    };

    const handleLoadQuery = (dashboard) => {
        const queryToLoad = {
            location: dashboard.details,
            dayOfYear: dashboard.dayOfYear,
            variables: dashboard.selectedVariables,
            thresholds: dashboard.thresholds || [],
        };
        
        setCurrentQuery(queryToLoad);
        setQueryResults(null); 
        setMessage(`Loaded configuration: ${dashboard.name}. Run query below.`);
        
        // Navigate to the query form (root dashboard path)
        if (window.location.pathname !== '/dashboard') {
            navigate('/dashboard');
        }
    };

    // Step 1: Show the custom confirmation box
    const handleDeleteConfirm = (id, name) => {
        setMessage(''); // Clear previous action messages
        setConfirmDelete({ id, name });
    };

    // Step 2: Execute the delete action
    const executeDelete = async () => {
        if (!confirmDelete) return;

        const { id, name } = confirmDelete;
        setConfirmDelete(null); // Close the confirmation UI/Modal
        
        try {
            await deleteDashboard(id);
            await fetchSavedDashboards(); 
            setMessage(`Dashboard "${name}" successfully deleted.`);
        } catch (err) {
            // Note: Error handling should be improved here, using custom UI modal instead of simple message
            setMessage(`Error deleting dashboard: ${err.toString()}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-full relative">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                Saved Configurations
            </h2>

            {/* Custom Confirmation UI (replaces window.confirm) */}
            {confirmDelete && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-10">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-red-500">
                        <p className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</p>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete the dashboard: <span className="font-bold">"{confirmDelete.name}"</span>? This cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <p className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message}
                </p>
            )}

            {loadingDashboards && (
                <div className="text-center p-10">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading saved dashboards...</p>
                </div>
            )}
            
            {dashboardError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p>{dashboardError}</p>
                </div>
            )}

            {!loadingDashboards && savedDashboards.length === 0 && (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-600">No dashboards saved yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Use the Query Form to create and save your first configuration.</p>
                </div>
            )}

            <div className="space-y-4">
                {savedDashboards.map(dashboard => (
                    <div 
                        key={dashboard._id} 
                        className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200 bg-white"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{dashboard.name}</h3>
                        
                        <div className="text-sm text-gray-600 space-y-1 mt-2">
                            <p><strong>Day of Year:</strong> <span className="font-semibold text-blue-600">{dashboard.dayOfYear}</span></p>
                            
                            {/* Corrected and safer location display */}
                            <p>
                                <strong>Location:</strong> {formatLocationDetails(dashboard.location, dashboard.details)}
                            </p>
                            
                            <p>
                                <strong>Variables:</strong> <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">{formatVariables(dashboard.selectedVariables)}</span>
                            </p>
                            
                            {dashboard.thresholds && dashboard.thresholds.length > 0 && (
                                <p>
                                    <strong>Thresholds Set:</strong> 
                                    {dashboard.thresholds.map((t, index) => (
                                        <span key={index} className="text-xs ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                                            {t.variable}: {t.value} {t.unit}
                                        </span>
                                    ))}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex space-x-3">
                            <button
                                onClick={() => handleLoadQuery(dashboard)}
                                className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                            >
                                Load & Run Query
                            </button>
                            <button
                                onClick={() => handleDeleteConfirm(dashboard._id, dashboard.name)}
                                className="px-4 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedDashboards;
