import axios from 'axios';

// --- 1. Configuration ---
// Set the base URL for your Express backend
// Ensure this matches the port your server is running on (e.g., 4000 or 5000)
const API_URL = 'http://localhost:4000/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- 2. Request Interceptor for Authentication ---
// This runs before every request. It checks localStorage for the token and attaches 
// it to the 'x-auth-token' header if it exists.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- 3. Authentication Endpoints ---

// POST /api/auth/register
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Registration failed';
    }
};

// POST /api/auth/login
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        
        // Store the JWT token upon successful login
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Login failed';
    }
};

// Utility function to remove token on logout
export const logoutUser = () => {
    localStorage.removeItem('token');
};


// --- 4. Weather Data Endpoints ---

// POST /api/weather/query
export const runWeatherQuery = async (queryData) => {
    try {
        const response = await api.post('/weather/query', queryData);
        return response.data;
    } catch (error) {
        // The backend returns { msg: "Server error during data processing." }
        throw error.response.data.msg || 'Failed to process weather query';
    }
};

// GET /api/weather/download/:filename
// Note: This function doesn't need to return JSON; it initiates a file download.
// The frontend can simply redirect or use an anchor tag for this public GET endpoint.
export const getDownloadUrl = (filename) => {
    return `${API_URL}/weather/download/${filename}`;
};


// --- 5. Dashboard (CRUD) Endpoints ---

// POST /api/dashboard
export const createDashboard = async (dashboardData) => {
    try {
        const response = await api.post('/dashboard', dashboardData);
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Failed to save dashboard';
    }
};

// GET /api/dashboard
export const getDashboards = async () => {
    try {
        const response = await api.get('/dashboard');
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Failed to fetch dashboards';
    }
};

// PUT /api/dashboard/:id
export const updateDashboard = async (id, updateData) => {
    try {
        const response = await api.put(`/dashboard/${id}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Failed to update dashboard';
    }
};

// DELETE /api/dashboard/:id
export const deleteDashboard = async (id) => {
    try {
        const response = await api.delete(`/dashboard/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data.msg || 'Failed to delete dashboard';
    }
};

// Export the main Axios instance for potential direct use (e.g., custom configuration)
export default api;