import React, { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../mainpage/mainpage.css';
import './pages.css';

function SettingsPage() {
    const [activeTab, setActiveTab] = useState('settings');
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                
                if (!token || !userId) {
                    navigate('/login');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch user data
                const userRes = await fetch(`http://localhost:8000/api/users/${userId}`, { headers });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserData(userData);
                } else {
                    console.error("Failed to fetch user data");
                }

                // Fetch matches for badge count
                const matchRes = await fetch('http://localhost:8000/api/matches', { headers });
                if (matchRes.ok) {
                    const matchData = await matchRes.json();
                    setMatches(matchData || []);
                }

                // Fetch messages for unread count
                const msgRes = await fetch('http://localhost:8000/api/messages', { headers });
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
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="mainpage-container">
            <aside className="main-sidebar">
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
                                        {calculateAge(userData.dob)} years old • {userData.gender} • 
                                        {userData.location || 'No location provided'}
                                    </p>
                                </div>
                                <button className="edit-profile-btn">Edit Profile</button>
                            </div>
                            
                            <div className="profile-sections">
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
                                    <p>{userData.looking_for ? userData.looking_for.charAt(0).toUpperCase() + userData.looking_for.slice(1) : 'Not specified'}</p>
                                </div>
                                
                                <div className="profile-section">
                                    <h3>Account Details</h3>
                                    <div className="account-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{userData.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Member Since:</span>
                                            <span className="detail-value">{formatDate(userData.created_at)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Last Active:</span>
                                            <span className="detail-value">{formatDate(userData.last_active)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-actions">
                                <button className="action-btn action-btn-secondary">Change Password</button>
                                <button className="action-btn action-btn-primary">Privacy Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SettingsPage;
