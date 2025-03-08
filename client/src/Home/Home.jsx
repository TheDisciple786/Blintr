import React from 'react';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import './home.css';

function Home() {
    return (
        <div>
        <Header/>
        <div className="home-container">
            <section className="hero">
                <h1>Connect Before You See</h1>
                <p>Experience meaningful connections where personality shines first</p>
                <button className="cta-button">Start Your Journey</button>
            </section>

            <section className="features">
                <div className="feature-card">
                    <i className="fas fa-comments"></i>
                    <h2>Genuine Connections</h2>
                    <p>Get to know people through meaningful conversations, not just photos</p>
                </div>
                <div className="feature-card">
                    <i className="fas fa-unlock-alt"></i>
                    <h2>Photo Reveal</h2>
                    <p>Photos unlock after 5 messages - let personality lead the way</p>
                </div>
                <div className="feature-card">
                    <i className="fas fa-heart"></i>
                    <h2>Real Chemistry</h2>
                    <p>Build authentic connections based on shared interests and values</p>
                </div>
            </section>

            <section className="about">
                <h2>Why Choose Us?</h2>
                <p>We believe true connections start with personality, not pictures. Our unique approach encourages meaningful conversations and helps you find genuine matches based on who you are, not just how you look.</p>
            </section>
        </div>
        <Footer/>
        </div>
    );
}

export default Home;