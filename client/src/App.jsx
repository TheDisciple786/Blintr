import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ContactUs from './Contact Us/ContactUs';
import Header from './Header/Header';
import Home from './Home/Home';
import Login from './Login/Login';
import Plans from './Plans/Plans';
import Safety from './Safety/Safety';
import Signup from './SignUp/Signup';
// Import other page components

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App; 