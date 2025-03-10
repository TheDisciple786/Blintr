import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ContactUs from './Contact Us/ContactUs';
import Home from './Home/Home';
import Login from './Login/Login';
import Plans from './Plans/Plans';
import Safety from './Safety/Safety';
import Signup from './SignUp/Signup';
import Mainpage from './mainpage/Mainpage';
import ChatPage from './pages/ChatPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Mainpage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/chat/:matchId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;