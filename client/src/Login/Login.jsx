import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [serverPort, setServerPort] = useState(null);
    const navigate = useNavigate();

    // Fetch the server port on component mount
    useEffect(() => {
        const fetchServerPort = async () => {
            try {
                // Use a fixed base URL to discover the actual port
                const response = await fetch('http://blintr-server.onrender.com/api/server-info');
                if (response.ok) {
                    const data = await response.json();
                    setServerPort(data.port);
                }
            } catch (err) {
                console.error("Failed to fetch server port:", err);
                // Fall back to default port
                setServerPort(8000);
            }
        };
        
        fetchServerPort();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors
        
        try {
            // Show an informative message during login attempt
            setError('Logging in... Please wait.');
            
            // Use the discovered port or fall back to environment variable or default
            const port = serverPort || process.env.REACT_APP_API_PORT || 8000;
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost';
            const apiUrl = `http://blintr-server.onrender.com`;
            
            const response = await fetch(`${apiUrl}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                setError(''); // Clear the "logging in" message
                alert("Login Successful!");
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                navigate('/main');
            } else {
                setError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                "Network error. Please check your internet connection or server availability. " +
                "Server might be at a different address than expected."
            );
        }
    };

    return (
        <div>
        <Header />
        <div className="auth-login-wrapper">
            <div className="auth-login-box">
                <h1 className="auth-login-title">Welcome Back</h1>
                {error && <div className="auth-error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-login-form">
                    <div className="auth-login-input-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username || ''}
                            onChange={handleChange}
                            className="auth-login-input"
                            required
                        />
                    </div>
                    <div className="auth-login-input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password || ''}
                            onChange={handleChange}
                            className="auth-login-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-login-button">
                        Log In
                    </button>
                </form>
                <div className="auth-login-links">
                    <a href="#forgot-password" className="auth-login-forgot">Forgot Password?</a>
                    <p className="auth-login-signup">
                        Don't have an account? <Link to="/signup" style={{ textDecoration: 'none', color: '#8B4513' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Login;