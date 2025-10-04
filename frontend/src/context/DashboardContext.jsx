import React, { createContext, useContext, useState, useEffect } from 'react';
// CORRECTED PATH: DashboardContext is in src/context/, so '../api/apiService' is correct.
import { getDashboards } from '../api/apiService';
// CORRECTED PATH: AuthContext is also in src/context/, so it should be imported from the local file name.
import { useAuth } from './AuthContext'; 

const DashboardContext = createContext();

const initialQueryState = {
    location: { lat: 34.0522, lon: -118.2437 }, // Default: Los Angeles
    dayOfYear: 1,
    variables: ['temperature', 'precipitation'],
    thresholds: [],
};

export const DashboardProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [savedDashboards, setSavedDashboards] = useState([]);
    const [currentQuery, setCurrentQuery] = useState(initialQueryState);
    const [queryResults, setQueryResults] = useState(null);
    const [loadingDashboards, setLoadingDashboards] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);

    // --- Core Functions ---

    const fetchSavedDashboards = async () => {
        if (!isAuthenticated) return;
        setLoadingDashboards(true);
        setDashboardError(null);
        try {
            const data = await getDashboards();
            setSavedDashboards(data);
        } catch (err) {
            console.error("Error fetching dashboards:", err);
            // Assuming error.message or similar for API errors
            setDashboardError(err.toString() || 'Could not load saved dashboards.');
            setSavedDashboards([]);
        } finally {
            setLoadingDashboards(false);
        }
    };
    
    // --- Effects ---
    
    // Fetch dashboards when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedDashboards();
        } else {
            setSavedDashboards([]); // Clear state on logout
        }
    }, [isAuthenticated]);

    const value = {
        savedDashboards,
        setSavedDashboards,
        currentQuery,
        setCurrentQuery,
        queryResults,
        setQueryResults,
        fetchSavedDashboards,
        loadingDashboards,
        dashboardError,
        initialQueryState,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
