import React, { useEffect, useRef, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaPaperPlane, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../mainpage/mainpage.css';
import './pages.css';

function ChatPage() {
    const [activeTab, setActiveTab] = useState('messages');
    const [userData, setUserData] = useState({});
    const [matchData, setMatchData] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [matches, setMatches] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { matchId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
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
                try {
                    const userRes = await fetch(`https://blintr-server.onrender.com/api/users/${userId}`, { headers });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserData(userData);
                    } else {
                        console.error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                // Fetch match data for the current match
                try {
                    const matchRes = await fetch(`https://blintr-server.onrender.com/api/matches/${matchId}`, { headers });
                    if (matchRes.ok) {
                        const match = await matchRes.json();
                        setMatchData(match);
                        
                        // Determine which user is the other person in the conversation
                        const other = match.user1._id === userId ? match.user2 : match.user1;
                        setOtherUser(other);
                    } else {
                        console.error("Failed to fetch match data");
                    }
                } catch (error) {
                    console.error("Error fetching match data:", error);
                }

                // Fetch messages for this match
                try {
                    const messagesRes = await fetch(`https://blintr-server.onrender.com/api/messages/${matchId}`, { headers });
                    if (messagesRes.ok) {
                        const messagesData = await messagesRes.json();
                        setMessages(messagesData);
                        
                        // Mark all unread messages as read
                        if (messagesData.some(msg => msg.receiver_id._id === userId && !msg.seen)) {
                            await fetch(`https://blintr-server.onrender.com/api/messages/${matchId}/read`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        }
                    } else {
                        console.error("Failed to fetch messages");
                    }
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }

                // Fetch all matches for the sidebar
                const allMatchesRes = await fetch('https://blintr-server.onrender.com/api/matches', { headers });
                const allMatchesData = await allMatchesRes.json();
                setMatches(allMatchesData || []);
                
                // Fetch conversations for the sidebar
                const msgRes = await fetch('https://blintr-server.onrender.com/api/messages', { headers });
                const msgData = await msgRes.json();
                setConversations(msgData || []);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Set up a polling interval to check for new messages
        const intervalId = setInterval(() => {
            fetchNewMessages();
        }, 5000);
        
        return () => clearInterval(intervalId);
        // eslint-disable-next-line
    }, [matchId, navigate]);

    useEffect(() => {
        // Scroll to bottom whenever messages change
        scrollToBottom();
    }, [messages]);

    const fetchNewMessages = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId || !matchId) return;

        const headers = { 'Authorization': `Bearer ${token}` };
        
        try {
            const messagesRes = await fetch(`https://blintr-server.onrender.com/api/messages/${matchId}`, { headers });
            if (messagesRes.ok) {
                const messagesData = await messagesRes.json();
                
                // Only update if there are new messages
                if (messagesData.length !== messages.length) {
                    setMessages(messagesData);
                    
                    // Mark new messages as read
                    const hasUnread = messagesData.some(msg => 
                        msg.receiver_id._id === userId && !msg.seen
                    );
                    
                    if (hasUnread) {
                        await fetch(`https://blintr-server.onrender.com/api/messages/${matchId}/read`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching new messages:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;
        
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId || !matchId || !otherUser) return;
        
        try {
            const response = await fetch('https://blintr-server.onrender.com/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    match_id: matchId,
                    receiver_id: otherUser._id,
                    message: newMessage
                })
            });
            
            if (response.ok) {
                setNewMessage('');
                fetchNewMessages();
            } else {
                console.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    const userId = localStorage.getItem('userId');

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
                        <span className="badge">
                            {conversations.filter(m => m.receiver_id._id === userId && !m.seen).length}
                        </span>
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
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="chat-user-info">
                            <div className={`chat-avatar ${matchData && !matchData.photos_unlocked ? 'blurred' : ''}`}>
                                {otherUser && otherUser.profile_photo && matchData && matchData.photos_unlocked ? (
                                    <img src={otherUser.profile_photo} alt={otherUser.username} />
                                ) : (
                                    <span>{otherUser?.username?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div className="chat-user-details">
                                <h2>{otherUser?.username || 'Chat'}</h2>
                                {matchData && !matchData.photos_unlocked && (
                                    <p className="unlock-status">
                                        Send {5 - Math.min(messages.length, 5)} more messages to unlock photos
                                    </p>
                                )}
                            </div>
                        </div>
                        <Link to="/messages" className="back-to-messages">
                            Back to messages
                        </Link>
                    </div>
                    
                    <div className="chat-messages-container">
                        <div className="chat-messages">
                            {messages.length > 0 ? (
                                messages.map(msg => (
                                    <div 
                                        key={msg._id} 
                                        className={`message ${msg.sender_id._id === userId ? 'outgoing' : 'incoming'}`}
                                    >
                                        <div className="message-content">
                                            <p>{msg.message}</p>
                                            <span className="message-time">{formatTime(msg.sent_at)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-messages">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    
                    <div className="chat-input-container">
                        <form onSubmit={handleSendMessage} className="chat-form">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="chat-input"
                            />
                            <button type="submit" className="send-button">
                                <FaPaperPlane /> Send
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ChatPage;
