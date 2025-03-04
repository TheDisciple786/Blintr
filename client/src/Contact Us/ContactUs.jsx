import React, { useState } from 'react';
import './contactus.css';

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted:', formData);
    };

    return (
        <div className="contact-container">
            <div className="contact-hero">
                <h1>Get in Touch</h1>
                <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="info-card">
                        <div className="icon">📍</div>
                        <h3>Address</h3>
                        <p>123 Business Street</p>
                        <p>New York, NY 10001</p>
                    </div>
                    <div className="info-card">
                        <div className="icon">📞</div>
                        <h3>Phone</h3>
                        <p>+1 (555) 123-4567</p>
                        <p>Mon-Fri 9am-6pm EST</p>
                    </div>
                    <div className="info-card">
                        <div className="icon">✉️</div>
                        <h3>Email</h3>
                        <p>info@blintr.com</p>
                        <p>support@blintr.com</p>
                    </div>
                </div>

                <div className="contact-form-container">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;