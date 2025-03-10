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
    const [photoPreview, setPhotoPreview] = useState(null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.match('image.*')) {
            setError('Please select an image file (png, jpg, jpeg, etc.)');
            return;
        }

        // Check if file is too large (max 5MB for raw file)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image file is too large. Please select an image under 5MB.');
            return;
        }

        // Create an image element to compress
        const img = new Image();
        img.onload = () => {
            // Create a canvas to resize and compress the image
            const canvas = document.createElement('canvas');
            
            // Calculate new dimensions - max 800px width/height while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > 800) {
                    height *= 800 / width;
                    width = 800;
                }
            } else {
                if (height > 800) {
                    width *= 800 / height;
                    height = 800;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw resized image on canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
            
            setFormData(prevState => ({
                ...prevState,
                profile_photo: compressedBase64
            }));
            setPhotoPreview(compressedBase64);
        };
        
        // Load the image
        img.onerror = () => setError('Error processing image');
        img.src = URL.createObjectURL(file);
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
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            
            const response = await fetch(`${apiUrl}/api/new_user`, {
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
            console.error("Registration error:", err);
            setError("Network error. Please check your internet connection or server availability.");
        }
    };

    return (
        <div>
        <Header />
        <div className="signup-container">
            <div className="signup-box">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
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
                            <label htmlFor="profile_photo">Profile Photo</label>
                            <input
                                type="file"
                                id="profile_photo"
                                name="profile_photo_upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input"
                                required
                            />
                            {photoPreview && (
                                <div className="photo-preview">
                                    <img 
                                        src={photoPreview} 
                                        alt="Profile Preview" 
                                        className="preview-image"
                                    />
                                </div>
                            )}
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