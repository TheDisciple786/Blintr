import React, { useEffect, useState } from 'react';
import { FaBell, FaComments, FaHeart, FaSearch, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './mainpage.css';

function Mainpage() {
    const [activeTab, setActiveTab] = useState('discover');
    const [recentMatches, setRecentMatches] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [recommendedMatches, setRecommendedMatches] = useState([]);
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

                // Fetch user data first
                try {
                    const userRes = await fetch(`http://localhost:8000/api/users/${userId}`, { headers });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        console.log("User data fetched:", userData); // Add logging to debug
                        setUserData(userData);
                    } else {
                        console.error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                // Fetch matches, messages, and recommendations
                const [matchRes, msgRes, recRes] = await Promise.all([
                    fetch('http://localhost:8000/api/matches', { headers }),
                    fetch('http://localhost:8000/api/messages', { headers }),
                    fetch('http://localhost:8000/api/recommendations', { headers })
                ]);

                const matchData = await matchRes.json();
                const msgData = await msgRes.json();
                const recData = await recRes.json();

                // Process match data to create proper UI objects
                const processedMatches = matchData.map(match => {
                    // Find the other user (not the current user)
                    const otherUser = match.user1._id === userId ? match.user2 : match.user1;
                    
                    return {
                        id: match._id,
                        name: otherUser.username,
                        bio: otherUser.bio,
                        interests: otherUser.interests || [],
                        messageCount: 0, // Will be updated from messages data
                        photosRevealed: match.photos_unlocked
                    };
                });

                // Process message data to count messages per match
                const messagesByMatch = {};
                const conversationData = [];
                
                msgData.forEach(msg => {
                    // Count messages for photo reveal calculation
                    if (!messagesByMatch[msg.match_id]) {
                        messagesByMatch[msg.match_id] = 0;
                    }
                    messagesByMatch[msg.match_id]++;
                    
                    // Find unique conversations
                    const existingConvo = conversationData.find(c => c.matchId === msg.match_id);
                    if (!existingConvo) {
                        // Find the other user in this conversation
                        const otherUser = msg.sender_id._id === userId ? msg.receiver_id : msg.sender_id;
                        
                        conversationData.push({
                            id: msg._id,
                            matchId: msg.match_id,
                            name: otherUser.username,
                            lastMessage: msg.message,
                            time: formatTimeAgo(new Date(msg.sent_at)),
                            unread: msg.receiver_id._id === userId && !msg.seen ? 1 : 0,
                            messageCount: 1,
                            photosRevealed: false // Will be updated based on match data
                        });
                    } else {
                        // Update existing conversation
                        if (new Date(msg.sent_at) > new Date(existingConvo.sent_at)) {
                            existingConvo.lastMessage = msg.message;
                            existingConvo.time = formatTimeAgo(new Date(msg.sent_at));
                        }
                        existingConvo.messageCount++;
                        if (msg.receiver_id._id === userId && !msg.seen) {
                            existingConvo.unread++;
                        }
                    }
                });
                
                // Update match message counts and photo reveal status
                processedMatches.forEach(match => {
                    match.messageCount = messagesByMatch[match.id] || 0;
                });
                
                // Update conversation photo reveal status based on match data
                conversationData.forEach(convo => {
                    const relatedMatch = matchData.find(m => m._id === convo.matchId);
                    if (relatedMatch) {
                        convo.photosRevealed = relatedMatch.photos_unlocked;
                    }
                });

                // Process recommendations to match UI needs
                const processedRecommendations = recData.map(user => ({
                    id: user._id,
                    name: user.username,
                    compatibility: calculateCompatibility(userData, user) + '%',
                    interests: user.interests || []
                }));

                setRecentMatches(processedMatches);
                setConversations(conversationData);
                setRecommendedMatches(processedRecommendations);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const messagesToReveal = (count) => (5 - count > 0 ? 5 - count : 0);
    
    const calculateCompatibility = (user1, user2) => {
        // Simple compatibility algorithm based on shared interests
        if (!user1.interests || !user2.interests) return 75; // Default if no interests
        
        const sharedInterests = user1.interests.filter(i => 
            user2.interests.includes(i)).length;
        
        const totalInterests = Math.max(
            user1.interests.length, 
            user2.interests.length
        );
        
        return Math.round((sharedInterests / totalInterests) * 100) || 75;
    };
    
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="mainpage-container">
            <aside className="main-sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="logo">Blintr</Link>
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
                    <button 
                        className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('discover')}>
                        <FaSearch /> Discover
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'matches' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('matches')}>
                        <FaHeart /> Matches
                        <span className="badge">{recentMatches.length}</span>
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('messages')}>
                        <FaComments /> Messages
                        <span className="badge">{conversations.reduce((sum, conv) => sum + conv.unread, 0)}</span>
                    </button>
                    <button className="nav-item">
                        <FaBell /> Notifications
                    </button>
                    <button className="nav-item">
                        <FaUserCog /> Settings
                    </button>
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
                        <h1>Welcome back, {userData.username || 'User'}</h1>
                        <p>Connect with people who appreciate your personality first</p>
                    </div>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <h3>{recentMatches.length}</h3>
                            <p>New Matches</p>
                        </div>
                        <div className="stat-card">
                            <h3>{conversations.reduce((sum, conv) => sum + conv.unread, 0)}</h3>
                            <p>New Messages</p>
                        </div>
                        <div className="stat-card">
                            <h3>{conversations.filter(c => c.photosRevealed).length}</h3>
                            <p>Photos Revealed</p>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-content">
                    <section className="matches-section">
                        <div className="section-header">
                            <h2>Recent Matches</h2>
                            <button className="see-all">See All</button>
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
                                <p>No matches yet. Start connecting with people!</p>
                            )}
                        </div>
                    </section>
                    
                    <div className="two-column-layout">
                        <section className="conversations-section">
                            <div className="section-header">
                                <h2>Conversations</h2>
                                <button className="see-all">See All</button>
                            </div>
                            
                            <div className="conversation-list">
                                {conversations.length > 0 ? (
                                    conversations.map(convo => (
                                        <div key={convo.id} className="conversation-card">
                                            <div className={`convo-avatar ${convo.photosRevealed ? '' : 'blurred'}`}>
                                                {!convo.photosRevealed && (
                                                    <div className="reveal-counter">
                                                        {messagesToReveal(convo.messageCount)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="convo-content">
                                                <div className="convo-header">
                                                    <h3>{convo.name}</h3>
                                                    <span className="convo-time">{convo.time}</span>
                                                </div>
                                                <p className="convo-message">{convo.lastMessage}</p>
                                            </div>
                                            {convo.unread > 0 && (
                                                <div className="unread-badge">{convo.unread}</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>No conversations yet. Start chatting with your matches!</p>
                                )}
                            </div>
                        </section>
                        
                        <section className="recommended-section">
                            <div className="section-header">
                                <h2>Recommended For You</h2>
                                <button className="see-all">Refresh</button>
                            </div>
                            
                            <div className="recommended-list">
                                {recommendedMatches.length > 0 ? (
                                    recommendedMatches.map(match => (
                                        <div key={match.id} className="recommended-card">
                                            <div className="recommended-photo-blur">
                                                <div className="compatibility-badge">
                                                    {match.compatibility} Match
                                                </div>
                                            </div>
                                            <div className="recommended-info">
                                                <h3>{match.name}</h3>
                                                <div className="recommended-interests">
                                                    {match.interests.map((interest, i) => (
                                                        <span key={i} className="interest-tag small">{interest}</span>
                                                    ))}
                                                </div>
                                                <div className="action-buttons">
                                                    <button className="skip-button">Skip</button>
                                                    <button className="connect-button">Connect</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No recommendations available right now.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Mainpage;