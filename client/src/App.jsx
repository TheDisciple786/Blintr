import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ContactUs from './Contact Us/ContactUs';
import Header from './Header/Header';
import Home from './Home/Home';
// Import other page components

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App; 