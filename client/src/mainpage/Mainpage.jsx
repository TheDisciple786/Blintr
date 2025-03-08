import React, { useState } from 'react';
import { FaBell, FaComments, FaHeart, FaSearch, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './mainpage.css';

function Mainpage() {
    // Sample data - would come from API in real app
    const [activeTab, setActiveTab] = useState('discover');
    
    const recentMatches = [
        { id: 1, name: 'Jamie', bio: 'Love hiking and photography', interests: ['Travel', 'Cooking', 'Art'], messageCount: 2 },
        { id: 2, name: 'Alex', bio: 'Book enthusiast and coffee addict', interests: ['Reading', 'Coffee', 'Movies'], messageCount: 3 },
        { id: 3, name: 'Taylor', bio: 'Musician and outdoor adventurer', interests: ['Music', 'Hiking', 'Yoga'], messageCount: 4 },
        { id: 4, name: 'Jordan', bio: 'Tech geek with a passion for food', interests: ['Technology', 'Cooking', 'Gaming'], messageCount: 1 },
    ];
    
    const conversations = [
        { id: 1, name: 'Riley', lastMessage: 'That sounds like a great idea!', time: '2m ago', unread: 2, messageCount: 3 },
        { id: 2, name: 'Casey', lastMessage: 'Would you like to meet for coffee?', time: '1h ago', unread: 0, messageCount: 7, photosRevealed: true },
        { id: 3, name: 'Quinn', lastMessage: 'I really enjoyed our conversation.', time: '3h ago', unread: 1, messageCount: 5, photosRevealed: true },
        { id: 4, name: 'Avery', lastMessage: 'What are your favorite movies?', time: '1d ago', unread: 0, messageCount: 4 }
    ];
    
    const recommendedMatches = [
        { id: 5, name: 'Morgan', compatibility: '92%', interests: ['Travel', 'Photography', 'Hiking'] },
        { id: 6, name: 'Skyler', compatibility: '89%', interests: ['Music', 'Art', 'Cooking'] },
        { id: 7, name: 'Drew', compatibility: '85%', interests: ['Sports', 'Movies', 'Technology'] }
    ];
    
    const messagesToReveal = (count) => {
        return 5 - count > 0 ? 5 - count : 0;
    };

    return (
        <div className="mainpage-container">
            {/* Navigation Sidebar */}
            <aside className="main-sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="logo">Blintr</Link>
                </div>
                
                <div className="user-preview">
                    <div className="user-avatar">
                        {/* Removed placeholderAvatar */}
                    </div>
                    <h3>Hi, Sam!</h3>
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
                    <button className="logout-button">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <main className="main-content">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h1>Welcome back, Sam</h1>
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
                
                {/* Main Dashboard Content */}
                <div className="dashboard-content">
                    {/* Your Matches */}
                    <section className="matches-section">
                        <div className="section-header">
                            <h2>Recent Matches</h2>
                            <button className="see-all">See All</button>
                        </div>
                        
                        <div className="matches-grid">
                            {recentMatches.map(match => (
                                <div key={match.id} className="match-card">
                                    <div className="match-photo-blur">
                                        <div className="match-messages-left">
                                            <span>{messagesToReveal(match.messageCount)} messages to reveal</span>
                                        </div>
                                    </div>
                                    <div className="match-info">
                                        <h3>{match.name}</h3>
                                        <p>{match.bio}</p>
                                        <div className="match-interests">
                                            {match.interests.map((interest, i) => (
                                                <span key={i} className="interest-tag">{interest}</span>
                                            ))}
                                        </div>
                                        <button className="message-button">Message</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <div className="two-column-layout">
                        {/* Conversations */}
                        <section className="conversations-section">
                            <div className="section-header">
                                <h2>Conversations</h2>
                                <button className="see-all">See All</button>
                            </div>
                            
                            <div className="conversation-list">
                                {conversations.map(convo => (
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
                                ))}
                            </div>
                        </section>
                        
                        {/* Recommended Matches */}
                        <section className="recommended-section">
                            <div className="section-header">
                                <h2>Recommended For You</h2>
                                <button className="see-all">Refresh</button>
                            </div>
                            
                            <div className="recommended-list">
                                {recommendedMatches.map(match => (
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
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Mainpage;