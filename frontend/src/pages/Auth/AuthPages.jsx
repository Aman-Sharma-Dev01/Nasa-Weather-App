import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Corrected import path. Since AuthPages is in src/pages/Auth/, 
// it should go up two levels to src/ then into api/
import { loginUser, registerUser } from '../../api/apiService'; 

// Assuming AuthContext is set up to handle global authentication state
// and stores the JWT token in localStorage upon successful login via apiService.
// We'll define a placeholder context for compile-time safety.
const AuthContext = React.createContext({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    // Simulate navigation function if using a real context/hook
    setToken: () => {} 
});

/**
 * LoginPage Component: Handles user sign-in.
 */
export const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // In a real app, you would uncomment this line:
    // const { setIsAuthenticated } = useContext(AuthContext); 

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await loginUser({ email, password });
            
            // In a real app: Update global state and navigate
            // setIsAuthenticated(true); 
            navigate('/dashboard'); 
            
        } catch (err) {
            // Handle error response from apiService
            const errorMessage = (err && typeof err === 'string') ? err : 'Login failed. Please check your credentials.';
            setError(errorMessage);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    Sign In to Dashboard
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        {error}
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition duration-200 ${
                            loading 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account? {' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * RegisterPage Component: Handles user registration.
 */
export const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { name, email, password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);

        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Register user, then attempt to log them in automatically (optional)
            await registerUser({ name, email, password });
            
            // Optional: Automatically log in after registration
            await loginUser({ email, password });

            navigate('/dashboard'); 
        } catch (err) {
            const errorMessage = (err && typeof err === 'string') ? err : 'Registration failed. User may already exist.';
            setError(errorMessage);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    Create NASA Dashboard Account
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        {error}
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength="6"
                            value={password}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="password2" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            id="password2"
                            name="password2"
                            type="password"
                            required
                            minLength="6"
                            value={password2}
                            onChange={onChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition duration-200 ${
                            loading 
                            ? 'bg-green-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                    >
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account? {' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
