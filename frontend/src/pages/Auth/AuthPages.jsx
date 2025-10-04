import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../api/apiService';

const AuthPage = ({ view }) => {
    const [isLoginView, setIsLoginView] = useState(view === 'login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoginView(view === 'login');
        setFormData({ name: '', email: '', password: '', password2: '' });
        setError(null);
        setSuccess(null);
    }, [view]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        setSuccess(null); // Clear previous success messages on new submission

        if (!isLoginView && formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (isLoginView) {
                await loginUser({ email: formData.email, password: formData.password });
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                await registerUser({ name: formData.name, email: formData.email, password: formData.password });
                setSuccess('Registration successful! Please sign in.');
                setTimeout(() => {
                    setIsLoginView(true);
                    setSuccess(null); // Clear success message after switching
                }, 2000);
            }
        } catch (err) {
            // --- MODIFIED SECTION ---
            // Log the detailed error to the developer console for debugging
            console.error("Authentication failed:", err);

            // Extract a user-friendly message from the error response
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
            setError(errorMessage);
            // --- END MODIFIED SECTION ---
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(prev => !prev);
        setError(null); // Clear errors when toggling view
        setSuccess(null); // Clear success messages when toggling view
    };

    // --- Styles (unchanged) ---
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      :root { --primary-color:#6a5acd; --secondary-color:#483d8b; --text-light:#f0f0f0; --text-dark:#333; --glass-bg-night:rgba(20,20,40,0.55); --glass-bg-day:rgba(255,255,255,0.35); --glass-border-night:rgba(255,255,255,0.2); --glass-border-day:rgba(255,255,255,0.8); }
      .auth-body { font-family:'Poppins',sans-serif;margin:0;padding:0;transition: color 0.5s; }
      .auth-night { color: var(--text-light); }
      .auth-day { color: var(--text-dark); }
      .auth-container { min-height:100vh; display:flex; justify-content:center; align-items:center; padding:1rem; }
      .background-container { position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden; transition:background 1.2s; }
      .auth-night .background-container { background: linear-gradient(to bottom, #000033, #191970); }
      .auth-day .background-container { background: linear-gradient(to bottom, #87CEEB, #f0f8ff); }
      .celestial-body { position:absolute; top:15%; width:100px; height:100px; border-radius:50%; transition: all 1.2s cubic-bezier(0.65,0,0.35,1); }
      .auth-day .celestial-body { left:15%; background:radial-gradient(circle,#FFD700,#FFA500); box-shadow:0 0 50px #FFD700; transform:translateX(0) rotate(0deg); }
      .auth-night .celestial-body { left:85%; background-color:#f0f0f0; box-shadow:0 0 30px #f0f0f0, 0 0 50px #fff; transform:translateX(-100%) rotate(360deg); }
      .star { position:absolute; background:white; border-radius:50%; animation:twinkle 2s infinite ease-in-out; opacity:0; transition: opacity 0.8s; }
      .auth-night .star { opacity:1; }
      @keyframes twinkle {0%,100%{opacity:0.5}50%{opacity:1; transform:scale(1.2)}}
      .auth-card { width:100%; max-width:420px; border-radius:16px; padding:2.5rem; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); transition:all 0.5s; }
      .auth-night .auth-card { background:var(--glass-bg-night); border:1px solid var(--glass-border-night); box-shadow:0 8px 32px 0 rgba(0,0,0,0.37); }
      .auth-day .auth-card { background:var(--glass-bg-day); border:1px solid var(--glass-border-day); box-shadow:0 8px 32px 0 rgba(0,0,0,0.1); }
      .auth-card h2 { font-size:2rem; font-weight:700; text-align:center; margin-bottom:1.5rem; }
      .form-input { width:100%; padding:0.5rem 1rem; border-radius:8px; margin-top:0.25rem; margin-bottom:0.5rem; border:1px solid #ccc; transition:all 0.2s ease-in-out; }
      .auth-night .form-input { background: rgba(0,0,0,0.2); border:1px solid var(--glass-border-night); color: var(--text-light); }
      .auth-day .form-input { background: rgba(255,255,255,0.4); border:1px solid rgba(0,0,0,0.1); color: var(--text-dark); }
      button { width:100%; padding:0.5rem 1rem; border:none; border-radius:8px; color:white; font-weight:600; cursor:pointer; transition:background 0.2s; }
      .auth-night button { background:#6a5acd; }
      .auth-day button { background:#483d8b; }
      .error { background:#f8d7da; color:#842029; padding:0.5rem; border-radius:6px; margin-bottom:0.5rem; }
      .success { background:#d1e7dd; color:#0f5132; padding:0.5rem; border-radius:6px; margin-bottom:0.5rem; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className={`auth-body ${isLoginView ? 'auth-night' : 'auth-day'}`}>
                {/* Background and other JSX remains the same */}
                <div className="background-container">
                    <div className="celestial-body"></div>
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className={`star s${i + 1}`}></div>
                    ))}
                </div>

                <div className="auth-container">
                    <div className="auth-card">
                        <h2>{isLoginView ? 'Sign In to AstroCast' : 'Create AstroCast Account'}</h2>

                        {error && <div className="error">{error}</div>}
                        {success && <div className="success">{success}</div>}

                        <form onSubmit={onSubmit}>
                            {!isLoginView && (
                                <div>
                                    <label>Name</label>
                                    <input name="name" value={formData.name} onChange={onChange} required className="form-input" placeholder="John Doe" />
                                </div>
                            )}
                            <div>
                                <label>Email</label>
                                <input name="email" type="email" value={formData.email} onChange={onChange} required className="form-input" placeholder="user@example.com" />
                            </div>
                            <div>
                                <label>Password</label>
                                <input name="password" type="password" value={formData.password} onChange={onChange} required minLength={6} className="form-input" placeholder="••••••••" />
                            </div>
                            {!isLoginView && (
                                <div>
                                    <label>Confirm Password</label>
                                    <input name="password2" type="password" value={formData.password2} onChange={onChange} required minLength={6} className="form-input" placeholder="••••••••" />
                                </div>
                            )}
                            <button type="submit" disabled={loading}>
                                {loading ? (isLoginView ? 'Signing In...' : 'Registering...') : isLoginView ? 'Sign In' : 'Register'}
                            </button>
                        </form>

                        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                            {isLoginView ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={toggleView} style={{ background: 'none', color: isLoginView ? '#9370DB' : '#483D8B', textDecoration: 'underline', width: 'auto', padding: 0 }}>
                                {isLoginView ? 'Register here' : 'Sign in here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;