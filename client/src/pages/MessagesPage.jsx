import React, { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../mainpage/mainpage.css';

function MessagesPage() {
    const [activeTab, setActiveTab] = useState('messages');
    const [conversations, setConversations] = useState([]);
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

                // Fetch matches and messages
                const [matchRes, msgRes] = await Promise.all([
                    fetch('http://localhost:8000/api/matches', { headers }),
                    fetch('http://localhost:8000/api/messages', { headers })
                ]);

                const matchData = await matchRes.json();
                const msgData = await msgRes.json();

                // Process matches for the badge count
                setRecentMatches(matchData || []);
                
                // Process message data
                const messagesByMatch = {};
                const conversationData = [];
                
                msgData.forEach(msg => {
                    if (!messagesByMatch[msg.match_id]) {
                        messagesByMatch[msg.match_id] = 0;
                    }
                    messagesByMatch[msg.match_id]++;
                    
                    const existingConvo = conversationData.find(c => c.matchId === msg.match_id);
                    if (!existingConvo) {
                        const otherUser = msg.sender_id._id === userId ? msg.receiver_id : msg.sender_id;
                        
                        conversationData.push({
                            id: msg._id,
                            matchId: msg.match_id,
                            name: otherUser.username,
                            lastMessage: msg.message,
                            time: formatTimeAgo(new Date(msg.sent_at)),
                            unread: msg.receiver_id._id === userId && !msg.seen ? 1 : 0,
                            messageCount: 1,
                            photosRevealed: false
                        });
                    } else {
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
                
                // Update photo reveal status
                conversationData.forEach(convo => {
                    const relatedMatch = matchData.find(m => m._id === convo.matchId);
                    if (relatedMatch) {
                        convo.photosRevealed = relatedMatch.photos_unlocked;
                    }
                });

                setConversations(conversationData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const messagesToReveal = (count) => (5 - count > 0 ? 5 - count : 0);
    
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
                <div className="page-header">
                    <h1>Your Messages</h1>
                    <p>Connect with your matches through conversation</p>
                </div>
                
                <div className="messages-container">
                    <div className="conversation-list-full">
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
                            <div className="no-content-message">
                                <h3>No conversations yet</h3>
                                <p>Start messaging your matches to begin a conversation!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MessagesPage;
