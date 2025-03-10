import React, { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../mainpage/mainpage.css';
import './pages.css';

function MessagesPage() {
    const [activeTab, setActiveTab] = useState('messages');
    const [conversations, setConversations] = useState([]);
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [matches, setMatches] = useState([]);
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
                
                // Get the server URL from environment or default to localhost
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                
                // Fetch user data, matches, and messages in parallel for efficiency
                const [userRes, matchRes, msgRes] = await Promise.all([
                    fetch(`${apiUrl}/api/users/${userId}`, { headers }),
                    fetch(`${apiUrl}/api/matches`, { headers }),
                    fetch(`${apiUrl}/api/messages`, { headers })
                ]);
                
                // Process user data
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserData(userData);
                }
                
                // Process matches and get valid match IDs
                const matchData = await matchRes.json();
                console.log("Fetched matches:", matchData.length);
                
                // Create a set of valid match IDs where the current user is part of the match
                const validMatchIds = new Set(
                    matchData.map(match => match._id)
                );
                console.log("Valid match IDs:", [...validMatchIds]);
                
                setMatches(matchData);
                
                // Process messages to create conversations
                const msgData = await msgRes.json();
                
                // Create conversations map to group messages by match
                const conversationsMap = new Map();
                
                // Only process messages from valid matches
                msgData.forEach(msg => {
                    // Skip if the message isn't part of a valid match
                    if (!validMatchIds.has(msg.match_id)) {
                        console.log(`Skipping message from invalid match: ${msg.match_id}`);
                        return;
                    }
                    
                    // Find the related match
                    const relatedMatch = matchData.find(m => m._id === msg.match_id);
                    if (!relatedMatch) {
                        console.log(`Match not found for message: ${msg.match_id}`);
                        return;
                    }
                    
                    // Find the other user in this conversation
                    const otherUser = msg.sender_id._id === userId ? msg.receiver_id : msg.sender_id;
                    
                    if (!conversationsMap.has(msg.match_id)) {
                        conversationsMap.set(msg.match_id, {
                            id: msg.match_id,
                            otherUser: otherUser,
                            messages: [msg],
                            lastMessage: msg.message,
                            lastMessageTime: new Date(msg.sent_at),
                            unreadCount: msg.receiver_id._id === userId && !msg.seen ? 1 : 0,
                            photosRevealed: relatedMatch.photos_unlocked || false
                        });
                    } else {
                        const convo = conversationsMap.get(msg.match_id);
                        convo.messages.push(msg);
                        
                        // Update last message if this one is newer
                        if (new Date(msg.sent_at) > convo.lastMessageTime) {
                            convo.lastMessage = msg.message;
                            convo.lastMessageTime = new Date(msg.sent_at);
                        }
                        
                        // Update unread count
                        if (msg.receiver_id._id === userId && !msg.seen) {
                            convo.unreadCount++;
                        }
                    }
                });
                
                // Convert conversations map to array and sort by last message time
                const sortedConversations = Array.from(conversationsMap.values())
                    .map(convo => ({
                        id: convo.id,
                        name: convo.otherUser.username,
                        lastMessage: convo.lastMessage,
                        time: formatTimeAgo(convo.lastMessageTime),
                        unread: convo.unreadCount,
                        photosRevealed: convo.photosRevealed,
                        otherUser: convo.otherUser
                    }))
                    .sort((a, b) => {
                        const timeA = new Date(a.time);
                        const timeB = new Date(b.time);
                        return timeB - timeA;
                    });
                
                console.log("Prepared conversations:", sortedConversations.length);
                setConversations(sortedConversations);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };
    
    const messagesToReveal = (conversationId) => {
        // Find the related match
        const match = matches.find(m => m._id === conversationId);
        if (!match) return 0;
        
        // Get message count for this match
        const messageCount = conversations.find(c => c.id === conversationId)?.messages?.length || 0;
        
        // Calculate remaining messages to reveal photos (5 message threshold)
        const remaining = 5 - messageCount;
        return remaining > 0 ? remaining : 0;
    };
    
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
                        <span className="badge">{matches.length}</span>
                    </Link>
                    <Link 
                        to="/messages"
                        className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('messages')}>
                        <FaComments /> Messages
                        <span className="badge">{conversations.reduce((sum, conv) => sum + conv.unread, 0)}</span>
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
                        <h1>Your Messages</h1>
                        <p>Stay connected with your matches</p>
                    </div>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <h3>{matches.length}</h3>
                            <p>Total Matches</p>
                        </div>
                        <div className="stat-card">
                            <h3>{conversations.length}</h3>
                            <p>Conversations</p>
                        </div>
                        <div className="stat-card">
                            <h3>{conversations.reduce((sum, conv) => sum + conv.unread, 0)}</h3>
                            <p>Unread Messages</p>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-content">
                    <section className="conversations-section full-width">
                        <div className="section-header">
                            <h2>All Conversations</h2>
                            <div className="filter-options">
                                <select className="message-filter">
                                    <option value="all">All Messages</option>
                                    <option value="unread">Unread</option>
                                    <option value="photos">Photos Revealed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="conversation-list-large">
                            {conversations.length > 0 ? (
                                conversations.map(convo => (
                                    <div 
                                        key={convo.id} 
                                        className="conversation-card"
                                        onClick={() => navigate(`/chat/${convo.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={`convo-avatar ${convo.photosRevealed ? '' : 'blurred'}`}>
                                            {convo.photosRevealed ? (
                                                <img 
                                                    src={convo.otherUser?.profile_photo || '/default-avatar.png'}
                                                    alt={convo.name}
                                                    className="avatar-image"
                                                />
                                            ) : (
                                                <div className="reveal-counter">
                                                    {messagesToReveal(convo.id)}
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
                                <div className="no-messages">
                                    <div className="no-content-message">
                                        <h3>No conversations yet</h3>
                                        <p>Match with people to start chatting!</p>
                                        <Link to="/main" className="explore-link">
                                            <button className="explore-button">Find Matches</button>
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

export default MessagesPage;
