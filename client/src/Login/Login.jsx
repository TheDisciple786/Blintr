import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempt:', formData);
    };

    return (
        <div className="auth-login-wrapper">
            <div className="auth-login-box">
                <h1 className="auth-login-title">Welcome Back</h1>
                <form onSubmit={handleSubmit} className="auth-login-form">
                    <div className="auth-login-input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
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
                            value={formData.password}
                            onChange={handleChange}
                            className="auth-login-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-login-button">Log In</button>
                </form>
                <div className="auth-login-links">
                    <a href="#forgot-password" className="auth-login-forgot">Forgot Password?</a>
                    <p className="auth-login-signup">
                        Don't have an account? <a><Link to="/signup">Sign Up</Link></a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;