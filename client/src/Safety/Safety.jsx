import React from 'react';
import { FaCamera, FaExclamationTriangle, FaHeart, FaLock, FaMapMarkerAlt, FaUserShield } from 'react-icons/fa';
import Header from '../Header/Header';
import './safety.css';

const Safety = () => {
    const safetyTips = [
        {
            icon: <FaUserShield />,
            title: "Profile Privacy",
            description: "Your photos remain private until you've exchanged 5 messages with a match. Never feel pressured to reveal yourself before you're ready.",
            tips: [
                "Use a nickname instead of your real name",
                "Avoid sharing personal contact details in your profile",
                "Think carefully about which photos you'll share"
            ]
        },
        {
            icon: <FaLock />,
            title: "Secure Messaging",
            description: "Our messaging system is designed to protect your privacy while allowing meaningful connections.",
            tips: [
                "Keep conversations within our platform",
                "Block and report suspicious behavior",
                "Trust your instincts if something feels off"
            ]
        },
        {
            icon: <FaCamera />,
            title: "Photo Safety",
            description: "While photos are hidden initially, it's important to be mindful of photo sharing.",
            tips: [
                "Only share photos you're comfortable with",
                "Avoid photos that show personal information",
                "Report users requesting photos outside the platform"
            ]
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Meeting in Person",
            description: "When you're ready to meet your match in person, follow these safety guidelines.",
            tips: [
                "Meet in public places",
                "Tell friends or family about your plans",
                "Arrange your own transportation",
                "Stay sober and alert"
            ]
        }
    ];

    return (
        <div>
        <Header />
        <div className="safety-container">
            <div className="safety-header">
                <h1>Your Safety is Our Priority</h1>
                <p>We've designed our platform with your safety in mind. Here are important guidelines to help you date safely.</p>
            </div>

            <div className="emergency-banner">
                <FaExclamationTriangle className="emergency-icon" />
                <div className="emergency-content">
                    <h3>Emergency?</h3>
                    <p>If you feel you're in immediate danger, contact your local emergency services immediately.</p>
                    <button className="emergency-button">Emergency Resources</button>
                </div>
            </div>

            <div className="safety-grid">
                {safetyTips.map((section, index) => (
                    <div key={index} className="safety-card">
                        <div className="safety-card-header">
                            <span className="safety-icon">{section.icon}</span>
                            <h2>{section.title}</h2>
                        </div>
                        <p className="safety-description">{section.description}</p>
                        <ul className="safety-tips">
                            {section.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="report-section">
                <div className="report-content">
                    <FaHeart className="report-icon" />
                    <h2>See Something Concerning?</h2>
                    <p>Your feedback helps keep our community safe. Report any suspicious behavior immediately.</p>
                    <button className="report-button">Report a Concern</button>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Safety;