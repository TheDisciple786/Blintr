import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login Successful!");
                localStorage.setItem('token', data.token); // Store the token
                localStorage.setItem('userId', data.userId); // Store the userId
                navigate('/main'); // Redirect to main page
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div>
        <Header />
        <div className="auth-login-wrapper">
            <div className="auth-login-box">
                <h1 className="auth-login-title">Welcome Back</h1>
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