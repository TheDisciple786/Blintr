import React from 'react';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>Connecting hearts through meaningful conversations. Join our community and discover authentic relationships.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/safety">Dating Safety</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect</h3>
          <div className="social-links">
            <a href="https://facebook.com/blintr" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="https://twitter.com/blintr" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="https://instagram.com/blintr" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com/company/blintr" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Blintr. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;