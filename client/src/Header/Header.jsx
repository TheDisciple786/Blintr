import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <h1>Blintr</h1>
      </div>
      <button className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-left">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/plans">Plans</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
        </ul>
        <ul className="nav-right">
          <li><button className="nav-button login"><Link to="/login">Login</Link></button></li>
          <li><button className="nav-button signup"><Link to="/signup">Sign Up</Link></button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;