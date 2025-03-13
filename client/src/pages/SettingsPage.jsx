import React, { useEffect, useState } from 'react';
import { FaComments, FaEye, FaEyeSlash, FaHeart, FaHome, FaLock, FaPencilAlt, FaSave, FaSignOutAlt, FaTimes, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../mainpage/mainpage.css';
import './pages.css';

function SettingsPage() {
    const [activeTab, setActiveTab] = useState('settings');
    const [userData, setUserData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        dob: '', // Changed from birthdate to dob to match model
        location: '',
        gender: '',
        looking_for: '', // Changed from lookingFor to looking_for
        interests: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [saveStatus, setSaveStatus] = useState('');
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchUserData();
        // eslint-disable-next-line
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                navigate('/login');
                return;
            }

            const headers = { 'Authorization': `Bearer ${token}` };
            const apiUrl = process.env.REACT_APP_API_URL || 'http://blintr-server.onrender.com';

            // Fetch user data
            const userRes = await fetch(`${apiUrl}/api/users/${userId}`, { headers });
            if (userRes.ok) {
                const data = await userRes.json();
                console.log("Fetched user data:", data); // Debug log
                setUserData(data);
                
                // Initialize form data with user data
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    bio: data.bio || '',
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '', // Using dob field
                    location: data.location ? 
                        (typeof data.location === 'object' ? 
                            `${data.location.city || ''}, ${data.location.country || ''}` : 
                            data.location) : 
                        '',
                    gender: data.gender || '',
                    looking_for: data.looking_for || '', // Using looking_for field
                    interests: data.interests ? data.interests.join(', ') : ''
                });
            } else {
                console.error("Failed to fetch user data");
            }

            // Fetch matches for badge count
            const matchRes = await fetch(`${apiUrl}/api/matches`, { headers });
            if (matchRes.ok) {
                const matchData = await matchRes.json();
                setMatches(matchData || []);
            }

            // Fetch messages for unread count
            const msgRes = await fetch(`${apiUrl}/api/messages`, { headers });
            if (msgRes.ok) {
                const msgData = await msgRes.json();
                // eslint-disable-next-line
                const unreadCount = msgData.filter(msg => 
                    msg.receiver_id._id === userId && !msg.seen
                ).length;
                setConversations(msgData || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (editMode) {
            // Cancel edit - reset form data from userData
            setFormData({
                username: userData.username || '',
                email: userData.email || '',
                bio: userData.bio || '',
                dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '', // Using dob field
                location: userData.location ? 
                    (typeof userData.location === 'object' ? 
                        `${userData.location.city || ''}, ${userData.location.country || ''}` : 
                        userData.location) : 
                    '',
                gender: userData.gender || '',
                looking_for: userData.looking_for || '', // Using looking_for field
                interests: userData.interests ? userData.interests.join(', ') : ''
            });
            setSaveStatus('');
        }
        setEditMode(!editMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Changing ${name} to:`, value); // Debug log
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveStatus('saving');
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                navigate('/login');
                return;
            }

            // Parse location if it's a string (city, country format)
            let locationObj = formData.location;
            if (typeof formData.location === 'string' && formData.location.includes(',')) {
                const [city, country] = formData.location.split(',').map(item => item.trim());
                locationObj = { city, country };
            }

            // Prepare data for submission with correct field names
            const submissionData = {
                username: formData.username,
                email: formData.email,
                bio: formData.bio,
                dob: formData.dob || null, // Using dob field
                location: locationObj,
                gender: formData.gender,
                looking_for: formData.looking_for, // Using looking_for field
                interests: formData.interests ? formData.interests.split(',').map(item => item.trim()) : []
            };

            console.log("Submitting data:", submissionData); // Debug log

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            const apiUrl = process.env.REACT_APP_API_URL || 'http://blintr-server.onrender.com';
            
            const response = await fetch(`${apiUrl}/api/users/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(submissionData)
            });
            
            const responseData = await response.json();
            
            if (response.ok) {
                console.log("Update successful:", responseData); // Debug log
                setUserData(responseData);
                setEditMode(false);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(''), 3000);
            } else {
                console.error("Update failed:", responseData); // Debug log
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        // Reset states
        setPasswordError('');
        setPasswordSuccess('');
        
        // Validate passwords
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }
        
        try {
            setPasswordLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                navigate('/login');
                return;
            }
            
            // Use the same API URL configuration as other functions
            // This ensures consistency with other API calls and respects environment variables
            const apiUrl = process.env.REACT_APP_API_URL || 'http://blintr-server.onrender.com';
            
            console.log("Sending password change request to:", apiUrl);
            
            const response = await fetch(`${apiUrl}/api/users/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            
            // Check if response exists before attempting to parse it
            if (response) {
                const data = await response.json();
                
                if (response.ok) {
                    setPasswordSuccess('Password changed successfully');
                    // Reset form after successful password change
                    setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        setShowPasswordModal(false);
                        setPasswordSuccess('');
                    }, 2000);
                } else {
                    setPasswordError(data.message || 'Failed to change password');
                }
            } else {
                throw new Error("No response received from server");
            }
        } catch (error) {
            console.error('Error changing password:', error);
            // Provide more user-friendly error message for connection issues
            if (error.message === 'Failed to fetch') {
                setPasswordError('Could not connect to the server. Please check your internet connection or try again later.');
            } else {
                setPasswordError(`An error occurred: ${error.message}`);
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="mainpage-container">
            <aside className="main-sidebar">
                {/* Sidebar content */}
                <div className="sidebar-header">
                    <Link to="/main" className="logo">Blintr</Link>
                </div>
                
                <div className="user-preview">
                    <div className="user-avatar">
                        {userData.profile_photo && (
                            <img 
                                src={userData.profile_photo} 
                                alt={userData.username} 
                            />
                        )}
                    </div>
                    <h3>Hi, {userData.username || 'User'}!</h3>
                    <p className="user-status">Online</p>
                </div>
                
                <nav className="main-nav">
                    <Link 
                        to="/main"
                        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('home')}>
                        <FaHome /> Home
                    </Link>
                    <Link 
                        to="/matches"
                        className={`nav-item ${activeTab === 'matches' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('matches')}>
                        <FaHeart /> Matches
                        <span className="badge">{matches.length}</span>
                    </Link>
                    <Link 
                        to="/messages"
                        className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('messages')}>
                        <FaComments /> Messages
                        <span className="badge">{conversations.filter(m => !m.seen).length}</span>
                    </Link>
                    <Link
                        to="/settings"
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}>
                        <FaUserCog /> Settings
                    </Link>
                </nav>
                
                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>
            
            <main className="main-content">
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h1>Your Profile</h1>
                        <p>View and manage your personal information</p>
                    </div>
                </div>
                
                <div className="dashboard-content">
                    <div className="settings-container">
                        <div className="settings-profile-card">
                            <div className="profile-header">
                                <div className="profile-photo-container">
                                    {userData.profile_photo ? (
                                        <img 
                                            src={userData.profile_photo} 
                                            alt={userData.username} 
                                            className="profile-photo"
                                        />
                                    ) : (
                                        <div className="profile-photo-placeholder">
                                            <span>{userData.username?.charAt(0).toUpperCase() || '?'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="profile-name-container">
                                    <h2>{userData.username}</h2>
                                    <p className="profile-details">
                                        {userData.dob && `${calculateAge(userData.dob)} years old • `}
                                        {userData.gender && `${userData.gender} • `}
                                        {userData.location && typeof userData.location === 'object' 
                                            ? `${userData.location.city || ''}, ${userData.location.country || ''}` 
                                            : userData.location || 'No location provided'}
                                    </p>
                                </div>
                                {!editMode ? (
                                    <button 
                                        className="edit-profile-btn" 
                                        onClick={handleEditToggle}
                                    >
                                        <FaPencilAlt /> Edit Profile
                                    </button>
                                ) : (
                                    <div className="edit-buttons">
                                        <button 
                                            className="cancel-edit-btn" 
                                            onClick={handleEditToggle}
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                        <button 
                                            className="save-profile-btn" 
                                            onClick={handleSubmit}
                                            disabled={saveStatus === 'saving'}
                                        >
                                            {saveStatus === 'saving' ? 'Saving...' : <><FaSave /> Save</>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {saveStatus === 'success' && (
                                <div className="status-message success">
                                    Profile updated successfully!
                                </div>
                            )}
                            
                            {saveStatus === 'error' && (
                                <div className="status-message error">
                                    Failed to update profile. Please try again.
                                </div>
                            )}
                            
                            <div className="profile-sections">
                                {editMode ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="profile-section">
                                            <h3>Basic Information</h3>
                                            <div className="edit-form-grid">
                                                <div className="form-group">
                                                    <label htmlFor="username">Username</label>
                                                    <input 
                                                        id="username"
                                                        type="text" 
                                                        name="username" 
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="email">Email</label>
                                                    <input 
                                                        id="email"
                                                        type="email" 
                                                        name="email" 
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="dob">Date of Birth</label>
                                                    <input 
                                                        id="dob"
                                                        type="date" 
                                                        name="dob" 
                                                        value={formData.dob}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="location">Location</label>
                                                    <input 
                                                        id="location"
                                                        type="text" 
                                                        name="location" 
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="gender">Gender</label>
                                                    <select 
                                                        id="gender"
                                                        name="gender" 
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
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
                                                        id="looking_for"
                                                        name="looking_for" 
                                                        value={formData.looking_for}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Preference</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="any">Any</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="profile-section">
                                            <h3>About You</h3>
                                            <div className="form-group">
                                                <label htmlFor="bio">Bio</label>
                                                <textarea 
                                                    id="bio"
                                                    name="bio" 
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    placeholder="Tell potential matches about yourself..."
                                                ></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="interests">Interests (comma-separated)</label>
                                                <input 
                                                    id="interests"
                                                    type="text" 
                                                    name="interests" 
                                                    value={formData.interests}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Reading, Hiking, Cooking"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="profile-section">
                                            <h3>About Me</h3>
                                            <p>{userData.bio || 'No bio provided yet.'}</p>
                                        </div>
                                        
                                        <div className="profile-section">
                                            <h3>Interests</h3>
                                            <div className="interests-container">
                                                {userData.interests && userData.interests.length > 0 ? (
                                                    userData.interests.map((interest, index) => (
                                                        <span key={index} className="interest-tag">{interest}</span>
                                                    ))
                                                ) : (
                                                    <p>No interests added yet.</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="profile-section">
                                            <h3>Looking For</h3>
                                            <p>{userData.looking_for ? 
                                                userData.looking_for.charAt(0).toUpperCase() + userData.looking_for.slice(1) : 
                                                'Not specified'}
                                            </p>
                                        </div>
                                        
                                        <div className="profile-section">
                                            <h3>Account Details</h3>
                                            <div className="account-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">Email:</span>
                                                    <span className="detail-value">{userData.email || 'Not specified'}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Location:</span>
                                                    <span className="detail-value">
                                                        {userData.location && typeof userData.location === 'object' 
                                                            ? `${userData.location.city || ''}, ${userData.location.country || ''}` 
                                                            : userData.location || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Date of Birth:</span>
                                                    <span className="detail-value">
                                                        {userData.dob ? 
                                                            new Date(userData.dob).toLocaleDateString() : 
                                                            'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Member Since:</span>
                                                    <span className="detail-value">
                                                        {userData.created_at ? 
                                                            new Date(userData.created_at).toLocaleDateString() : 
                                                            'Not available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="profile-actions">
                                    <button 
                                        className="action-btn action-btn-primary"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2><FaLock /> Change Password</h2>
                            <button 
                                className="modal-close-btn"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            {passwordError && (
                                <div className="password-error">
                                    {passwordError}
                                </div>
                            )}
                            
                            {passwordSuccess && (
                                <div className="password-success">
                                    {passwordSuccess}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setShowPasswordModal(false)}
                                    disabled={passwordLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="save-btn"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsPage;
