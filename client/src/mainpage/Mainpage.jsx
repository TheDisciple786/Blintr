import React, { useEffect, useState } from 'react';
import { FaComments, FaHeart, FaHome, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './mainpage.css';

function Mainpage() {
    const [activeTab, setActiveTab] = useState('home');
    const [recentMatches, setRecentMatches] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [recommendedMatches, setRecommendedMatches] = useState([]);
    const [skippedRecommendations, setSkippedRecommendations] = useState(new Set());
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
                
                // Get the server URL from environment or default to localhost
                const apiUrl = process.env.REACT_APP_API_URL || 'https://blintr-server.onrender.com';

                // Fetch user data first to ensure it's available for filtering
                let currentUserData = {};
                try {
                    const userRes = await fetch(`${apiUrl}/api/users/${userId}`, { headers });
                    if (userRes.ok) {
                        currentUserData = await userRes.json();
                        console.log("User data fetched:", currentUserData);
                        setUserData(currentUserData);
                    } else {
                        console.error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                // Fetch matches, messages, and recommendations
                const [matchRes, msgRes, recRes] = await Promise.all([
                    fetch(`${apiUrl}/api/matches`, { headers }),
                    fetch(`${apiUrl}/api/messages`, { headers }),
                    fetch(`${apiUrl}/api/recommendations`, { headers })
                ]);

                const matchData = await matchRes.json();
                const msgData = await msgRes.json();
                const recData = await recRes.json();

                console.log("Recommendations received:", recData.length);
                console.log("User preferences:", currentUserData.looking_for);

                // Process match data to create proper UI objects - only include actual matches
                const processedMatches = matchData
                    .filter(match => {
                        // Double-check that this is a valid match with both users
                        return match.user1 && match.user2;
                    })
                    .map(match => {
                        // Find the other user (not the current user)
                        const otherUser = match.user1._id === userId ? match.user2 : match.user1;
                        
                        return {
                            id: match._id,
                            name: otherUser.username,
                            bio: otherUser.bio,
                            interests: otherUser.interests || [],
                            messageCount: 0, // Will be updated from messages data
                            photosRevealed: match.photos_unlocked,
                            otherUser: otherUser // Store the other user object to access the profile photo
                        };
                    });

                console.log("Processed matches:", processedMatches.length);

                // Create a set of user IDs that are already matched with the current user
                const matchedUserIds = new Set(matchData.map(match => {
                    // Get the ID of the other user in each match
                    return match.user1._id === userId ? match.user2._id : match.user1._id;
                }));

                console.log("Already matched user IDs:", [...matchedUserIds]);

                // Create a set of valid match IDs
                const validMatchIds = new Set(matchData.map(match => match._id));
                console.log("Valid match IDs for conversations:", [...validMatchIds]);

                // Process message data to count messages per match - ONLY for valid matches
                const messagesByMatch = {};
                const conversationData = [];
                
                msgData.forEach(msg => {
                    // Skip messages that don't belong to valid matches
                    if (!validMatchIds.has(msg.match_id)) {
                        console.log(`Skipping message from invalid match: ${msg.match_id}`);
                        return;
                    }
                    
                    // Count messages for photo reveal calculation
                    if (!messagesByMatch[msg.match_id]) {
                        messagesByMatch[msg.match_id] = 0;
                    }
                    messagesByMatch[msg.match_id]++;
                    
                    // Find match this message belongs to
                    const relatedMatch = matchData.find(m => m._id === msg.match_id);
                    if (!relatedMatch) {
                        console.log(`Match not found for message: ${msg.match_id}`);
                        return;
                    }
                    
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
                            photosRevealed: relatedMatch.photos_unlocked,
                            otherUser: otherUser // Store the other user object
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

                // Filter recommendations to exclude:
                // 1. Users already matched with the current user
                // 2. Users that don't match the gender preference
                const filteredRecData = recData.filter(rec => {
                    // Skip users that are already matched
                    if (matchedUserIds.has(rec._id)) {
                        console.log(`Filtering out ${rec.username} - already matched`);
                        return false;
                    }
                    
                    // If no preference is set yet or preference is "any", show all
                    if (!currentUserData.looking_for || currentUserData.looking_for === 'any') {
                        console.log(`Showing ${rec.username} - user has no preference or preference is "any"`);
                        return true;
                    }
                    
                    // Otherwise, check if the recommendation matches the preference
                    const matchesPreference = rec.gender === currentUserData.looking_for;
                    console.log(`${rec.username} (${rec.gender}) matches preference (${currentUserData.looking_for})? ${matchesPreference}`);
                    return matchesPreference;
                });

                console.log("Filtered recommendations count:", filteredRecData.length);

                // Process recommendations to match UI needs
                const processedRecommendations = filteredRecData.map(user => ({
                    id: user._id,
                    name: user.username,
                    gender: user.gender, // Store gender for debugging
                    compatibility: calculateCompatibility(currentUserData, user) + '%',
                    interests: user.interests || [],
                    bio: user.bio || 'No bio available'
                }));

                setRecentMatches(processedMatches);
                setConversations(conversationData);
                setRecommendedMatches(processedRecommendations);
                
                // Log the filtered recommendations for debugging
                console.log("User's preference:", currentUserData.looking_for);
                console.log("Filtered recommendations:", processedRecommendations);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line
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
        navigate('/');
    };

    // Handler for skipping a recommendation
    const handleSkip = (matchId) => {
        setSkippedRecommendations(prev => new Set(prev).add(matchId));
    };

    // Handler for connecting with a recommendation
    const handleConnect = async (match) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                navigate('/login');
                return;
            }

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Get the server URL from environment or default to localhost
            const apiUrl = process.env.REACT_APP_API_URL || 'https://blintr-server.onrender.com';
            
            console.log("Creating match between", userId, "and", match.id);

            // Create a new match with this person
            const response = await fetch(`${apiUrl}/api/matches/create`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    userId: userId,
                    matchedUserId: match.id
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log("Match created successfully:", data);
                // Navigate to chat with the new match
                navigate(`/chat/${data.matchId}`);
            } else {
                console.error("Failed to connect with recommendation:", data.message);
                alert("Failed to connect: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error connecting with recommendation:", error);
            alert("Error connecting with recommendation. Please try again.");
        }
    };

    // Filter out skipped recommendations from the displayed list
    const filteredRecommendations = recommendedMatches.filter(
        match => !skippedRecommendations.has(match.id)
    );

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
                                        <div className={`match-photo-blur ${match.photosRevealed ? "photos-revealed" : ""}`}>
                                            {match.photosRevealed ? (
                                                <img 
                                                    src={match.otherUser?.profile_photo || '/default-avatar.png'}
                                                    alt={match.name}
                                                    className="revealed-photo"
                                                />
                                            ) : (
                                                <div className="match-messages-left">
                                                    <span>{messagesToReveal(match.messageCount)} messages to reveal</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="match-info">
                                            <h3>{match.name}</h3>
                                            <p>{match.bio || 'No bio available'}</p>
                                            <div className="match-interests">
                                                {match.interests.map((interest, i) => (
                                                    <span key={i} className="interest-tag">{interest}</span>
                                                ))}
                                            </div>
                                            <button 
                                                className="message-button" 
                                                onClick={() => navigate(`/chat/${match.id}`)}
                                            >
                                                Message
                                            </button>
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
                                        <div 
                                            key={convo.id} 
                                            className="conversation-card"
                                            onClick={() => navigate(`/chat/${convo.matchId}`)}
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
                                {filteredRecommendations.length > 0 ? (
                                    filteredRecommendations.map(match => (
                                        <div key={match.id} className="recommended-card">
                                            <div className="recommended-photo-blur">
                                                <div className="compatibility-badge">
                                                    {match.compatibility} Match
                                                </div>
                                            </div>
                                            <div className="recommended-info">
                                                <h3>{match.name}</h3>
                                                <p>{match.bio}</p>
                                                <div className="recommended-interests">
                                                    {match.interests && match.interests.map((interest, i) => (
                                                        <span key={i} className="interest-tag small">{interest}</span>
                                                    ))}
                                                </div>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="skip-button"
                                                        onClick={() => handleSkip(match.id)}
                                                    >
                                                        Skip
                                                    </button>
                                                    <button 
                                                        className="connect-button"
                                                        onClick={() => handleConnect(match)}
                                                    >
                                                        Connect
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No recommendations available right now. Try again later.</p>
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