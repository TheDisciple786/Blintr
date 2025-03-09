import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './signup.css';

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        bio: '',
        interests: '',
        profile_photo: '',
        gender: '',
        looking_for: '',
        dob: '',
        location: ''
    });

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setStep(prevStep => prevStep + 1);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        const formattedData = {
            ...formData,
            interests: formData.interests.split(',').map(interest => interest.trim())
        };
        try {
            const response = await fetch('http://localhost:8000/api/new_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData)
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signup Successful!");
                navigate('/login'); // Redirect to login page
            } else {
                setError(data.message || "Signup failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
        console.log('Form submitted:', formData);
    };

    return (
        <div>
        <Header />
        <div className="signup-container">
            <div className="signup-box">
                <h2>Create Account</h2>
                {step === 1 && (
                    <form onSubmit={handleNextStep}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="signup-button">
                            Next
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleNextStep}>
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                name="bio"
                                placeholder="Tell us about yourself"
                                value={formData.bio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="interests">Interests</label>
                            <input
                                type="text"
                                name="interests"
                                placeholder="Interests (comma separated)"
                                value={formData.interests}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="signup-button">
                            Next
                        </button>
                    </form>
                )}
                {step === 3 && (
                    <form onSubmit={handleNextStep}>
                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="looking_for">Looking For</label>
                            <select
                                name="looking_for"
                                value={formData.looking_for}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Preference</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="any">Any</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="signup-button">
                            Next
                        </button>
                    </form>
                )}
                {step === 4 && (
                    <form onSubmit={handleFinalSubmit}>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="City, Country"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_photo">Profile Photo URL</label>
                            <input
                                type="text"
                                name="profile_photo"
                                placeholder="Profile Photo URL"
                                value={formData.profile_photo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="signup-button">
                            Sign Up
                        </button>
                    </form>
                )}
                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
        </div>
    );
}

export default Signup;