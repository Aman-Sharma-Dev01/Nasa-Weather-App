import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { runWeatherQuery, createDashboard } from '../../api/apiService';

// Define the available NASA variables and their default units for the UI
const NASA_VARIABLES = [
    { name: 'Temperature', key: 'temperature', unit: 'Fahrenheit / Kelvin' },
    { name: 'Precipitation Rate', key: 'precipitation', unit: 'mm/hr' },
    { name: 'Wind Speed (10m)', key: 'windspeed', unit: 'm/s' },
    { name: 'Relative Humidity (2m)', key: 'relative_humidity', unit: '%' },
    { name: 'Solar Insolation', key: 'solar_insolation', unit: 'W/m^2' },
    { name: 'Solar Radiation', key: 'solar_radiation', unit: 'unitless' },
];

const QueryForm = () => {
    const { 
        currentQuery, 
        setCurrentQuery, 
        setQueryResults, 
        fetchSavedDashboards, 
        initialQueryState 
    } = useDashboard();
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [dashboardName, setDashboardName] = useState('');
    const [thresholdInput, setThresholdInput] = useState({});

    // --- State Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMessage('');

        if (name === 'lat' || name === 'lon') {
            setCurrentQuery(prev => {
                // Defensive initialization of location if it's null/undefined
                const location = prev.location || {}; 
                
                return {
                    ...prev,
                    location: {
                        ...location, // Use the safely initialized or existing location object
                        [name]: parseFloat(value) || 0,
                    }
                };
            });
        } else if (name === 'dayOfYear') {
            setCurrentQuery(prev => ({
                ...prev,
                [name]: parseInt(value) || 1,
            }));
        }
    };

    const handleVariableToggle = (key) => {
        setCurrentQuery(prev => {
            const newVariables = prev.variables.includes(key)
                ? prev.variables.filter(v => v !== key)
                : [...prev.variables, key];

            // Auto-remove thresholds for deselected variables
            const newThresholds = prev.thresholds.filter(t => newVariables.includes(t.variable));

            return {
                ...prev,
                variables: newVariables,
                thresholds: newThresholds,
            };
        });
        setMessage('');
    };

    const handleThresholdChange = (key, value) => {
        setThresholdInput(prev => ({
            ...prev,
            [key]: {
                value: value,
            }
        }));
    };

    const handleAddThreshold = (key, unit) => {
        const inputData = thresholdInput[key];
        
        // Use a safe regex to extract the primary unit (e.g., 'Fahrenheit' from 'Fahrenheit / Kelvin')
        const primaryUnit = unit.split('/')[0].trim();
        const finalUnit = primaryUnit === 'Fahrenheit' ? 'F' : primaryUnit;

        if (!inputData || inputData.value === undefined || inputData.value === null || inputData.value === '') {
            setMessage(`Please enter a valid numeric threshold value for ${key}.`);
            return;
        }

        const newThreshold = {
            variable: key,
            value: parseFloat(inputData.value),
            unit: finalUnit, 
        };

        setCurrentQuery(prev => {
            // Remove existing threshold for this variable, then add new one
            const filteredThresholds = prev.thresholds.filter(t => t.variable !== key);
            return {
                ...prev,
                thresholds: [...filteredThresholds, newThreshold]
            };
        });
        setMessage(`Threshold added for ${key}: ${newThreshold.value} ${newThreshold.unit}.`);
    };

    const handleRemoveThreshold = (key) => {
        setCurrentQuery(prev => ({
            ...prev,
            thresholds: prev.thresholds.filter(t => t.variable !== key),
        }));
        setMessage(`Threshold removed for ${key}.`);
    };

    // --- API Calls ---
    const handleSubmitQuery = async (e) => {
        e.preventDefault();
        
        // --- UPDATED VALIDATION LOGIC ---
        if (currentQuery.variables.length === 0) {
            setMessage('Please select at least one variable.');
            return;
        }
        
        // Check if lat/lon are missing or invalid
        const lat = currentQuery.location?.lat;
        const lon = currentQuery.location?.lon;

        if (lat === null || lat === undefined || isNaN(lat) || lon === null || lon === undefined || isNaN(lon)) {
             setMessage('Please enter valid, non-zero Latitude and Longitude values.');
             return;
        }
        // --- END UPDATED VALIDATION LOGIC ---
        
        setLoading(true);
        setQueryResults(null);
        setMessage('');

        // The payload for the backend includes the final thresholds from currentQuery state
        const finalQuery = { ...currentQuery }; 

        try {
            const data = await runWeatherQuery(finalQuery);
            setQueryResults(data);
            setMessage('Query executed successfully! Results are now visible below.');
        } catch (err) {
            console.error(err);
            setMessage(`Error running query: ${err}`);
            setQueryResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDashboard = async () => {
        if (!dashboardName.trim()) {
            setMessage('Please enter a name for the dashboard before saving.');
            return;
        }
        if (currentQuery.variables.length === 0) {
            setMessage('Select at least one variable before saving.');
            return;
        }
        
        // --- UPDATED VALIDATION LOGIC FOR SAVING ---
        const lat = currentQuery.location?.lat;
        const lon = currentQuery.location?.lon;
        if (lat === null || lat === undefined || isNaN(lat) || lon === null || lon === undefined || isNaN(lon)) {
             setMessage('Cannot save: Please enter valid coordinates before saving.');
             return;
        }
        // --- END UPDATED VALIDATION LOGIC ---

        const dashboardData = {
            name: dashboardName.trim(),
            location: 'Pin', 
            details: currentQuery.location,
            dayOfYear: currentQuery.dayOfYear,
            selectedVariables: currentQuery.variables,
            thresholds: currentQuery.thresholds,
        };

        try {
            setLoading(true);
            await createDashboard(dashboardData);
            setDashboardName('');
            await fetchSavedDashboards(); 
            setMessage(`Dashboard "${dashboardName.trim()}" saved successfully!`);
        } catch (err) {
            setMessage(`Failed to save dashboard: ${err}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Helper to check if a threshold exists for a variable
    const getActiveThreshold = (key) => currentQuery.thresholds.find(t => t.variable === key);

    return (
        <form onSubmit={handleSubmitQuery} className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                New Weather Dashboard Query
            </h2>
            
            {/* Location and Day */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (Lat/Lon)</label>
                    <p className="text-xs text-gray-500 mb-2">Historical data search is based on this geographic point.</p>
                </div>
                <input
                    type="number"
                    name="lat"
                    placeholder="Latitude (e.g., 34.05)"
                    // Defensive reading: use optional chaining and empty string as fallback
                    value={currentQuery.location?.lat || ''} 
                    onChange={handleInputChange}
                    required
                    step="0.0001"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <input
                    type="number"
                    name="lon"
                    placeholder="Longitude (e.g., -118.24)"
                    // Defensive reading
                    value={currentQuery.location?.lon || ''} 
                    onChange={handleInputChange}
                    required
                    step="0.0001"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <input
                    type="number"
                    name="dayOfYear"
                    placeholder="Day of Year (1-366)"
                    value={currentQuery.dayOfYear || 1}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="366"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>

            {/* Variable Selection and Thresholds */}
            <div className="mb-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Select Variables & Thresholds</h3>
                <p className="text-sm text-gray-600">Optionally set a threshold to calculate the historical probability of exceeding it.</p>
                
                <div className="space-y-3">
                    {NASA_VARIABLES.map(variable => (
                        <div key={variable.key} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentQuery.variables.includes(variable.key)}
                                        onChange={() => handleVariableToggle(variable.key)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">
                                        {variable.name} <span className="text-xs text-gray-500">({variable.unit})</span>
                                    </span>
                                </label>
                                {currentQuery.variables.includes(variable.key) && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getActiveThreshold(variable.key) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {getActiveThreshold(variable.key) ? `Threshold Set: ${getActiveThreshold(variable.key).value} ${getActiveThreshold(variable.key).unit}` : 'No Threshold'}
                                    </span>
                                )}
                            </div>

                            {/* Threshold Input Area */}
                            {currentQuery.variables.includes(variable.key) && (
                                <div className="mt-3 pl-8 flex space-x-2 items-center">
                                    <input
                                        type="number"
                                        placeholder={`Value in ${variable.unit.split('/')[0].trim()}`}
                                        onChange={(e) => handleThresholdChange(variable.key, e.target.value)}
                                        // Ensure the input field controls its own state for better UX
                                        value={thresholdInput[variable.key]?.value || ''} 
                                        step="any"
                                        className="p-1.5 border border-gray-300 rounded-lg text-sm w-48 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-500">{variable.unit.split('/')[0].trim()}</span>
                                    
                                    {!getActiveThreshold(variable.key) ? (
                                        <button
                                            type="button"
                                            onClick={() => handleAddThreshold(variable.key, variable.unit)}
                                            className="ml-4 px-3 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                                            disabled={!thresholdInput[variable.key]?.value}
                                        >
                                            Add Threshold
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveThreshold(variable.key)}
                                            className="ml-4 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition disabled:bg-gray-400 flex items-center"
                    disabled={loading || currentQuery.variables.length === 0}
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Run NASA Query'}
                </button>
                
                {/* Save Dashboard Section */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Dashboard Name (to save)"
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg text-sm w-48"
                    />
                    <button
                        type="button"
                        onClick={handleSaveDashboard}
                        disabled={loading || currentQuery.variables.length === 0 || !dashboardName.trim()}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition disabled:bg-gray-400 text-sm"
                    >
                        Save Config
                    </button>
                </div>
            </div>

            {/* Message Area */}
            {message && (
                <p className={`mt-3 p-3 rounded-lg text-sm font-medium ${message.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message}
                </p>
            )}
        </form>
    );
};

export default QueryForm;
