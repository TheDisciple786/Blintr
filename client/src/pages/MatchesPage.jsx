import React, { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../mainpage/mainpage.css';
import './pages.css'; // We'll create this for additional styles

function MatchesPage() {
    const [activeTab, setActiveTab] = useState('matches');
    const [recentMatches, setRecentMatches] = useState([]);
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                
                if (!token || !userId) {
                    navigate('/login');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch user data
                try {
                    const userRes = await fetch(`http://localhost:8000/api/users/${userId}`, { headers });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserData(userData);
                    } else {
                        console.error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                // Fetch matches
                const matchRes = await fetch('http://localhost:8000/api/matches', { headers });
                const matchData = await matchRes.json();

                // Process match data
                const processedMatches = matchData.map(match => {
                    // Find the other user (not the current user)
                    const otherUser = match.user1._id === userId ? match.user2 : match.user1;
                    
                    return {
                        id: match._id,
                        name: otherUser.username,
                        bio: otherUser.bio,
                        interests: otherUser.interests || [],
                        messageCount: 0,
                        photosRevealed: match.photos_unlocked
                    };
                });

                setRecentMatches(processedMatches);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const messagesToReveal = (count) => (5 - count > 0 ? 5 - count : 0);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    if (isLoading) {
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
                        <span className="badge">{recentMatches.length}</span>
                    </Link>
                    <Link 
                        to="/messages"
                        className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('messages')}>
                        <FaComments /> Messages
                    </Link>
                    <Link
                        to="/settings"
                        className="nav-item">
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
                        <h1>Your Matches</h1>
                        <p>Connect with people who appreciate your personality first</p>
                    </div>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <h3>{recentMatches.length}</h3>
                            <p>Total Matches</p>
                        </div>
                        <div className="stat-card">
                            <h3>{recentMatches.filter(m => m.photosRevealed).length}</h3>
                            <p>Photos Revealed</p>
                        </div>
                        <div className="stat-card">
                            <h3>{recentMatches.filter(m => m.messageCount > 0).length}</h3>
                            <p>Active Chats</p>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-content">
                    <section className="matches-section full-width">
                        <div className="section-header">
                            <h2>All Matches</h2>
                            <div className="filter-options">
                                <select className="match-filter">
                                    <option value="all">All Matches</option>
                                    <option value="recent">Most Recent</option>
                                    <option value="photos">Photos Revealed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="matches-grid">
                            {recentMatches.length > 0 ? (
                                recentMatches.map(match => (
                                    <div key={match.id} className="match-card">
                                        <div className="match-photo-blur">
                                            <div className="match-messages-left">
                                                <span>{messagesToReveal(match.messageCount)} messages to reveal</span>
                                            </div>
                                        </div>
                                        <div className="match-info">
                                            <h3>{match.name}</h3>
                                            <p>{match.bio || 'No bio available'}</p>
                                            <div className="match-interests">
                                                {match.interests.map((interest, i) => (
                                                    <span key={i} className="interest-tag">{interest}</span>
                                                ))}
                                            </div>
                                            <button className="message-button">Message</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-matches">
                                    <div className="no-content-message">
                                        <h3>No matches yet</h3>
                                        <p>Explore recommendations and connect with new people!</p>
                                        <Link to="/main" className="explore-link">
                                            <button className="explore-button">Explore Recommendations</button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default MatchesPage;
