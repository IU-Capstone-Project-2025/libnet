import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import "./Navbar.css"

export default function Navbar() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div id="navbar">
      <div>
        <span id="navbar-logo" onClick={() => navigate('/')}>libnet</span>
        <Link to="/" id="navbar-link">Каталог</Link>
        <Link to="/orders" id="navbar-link">Заказы</Link>
        <Link to="/faq" id="navbar-link">FAQ</Link>
        <Link to="/favorites" id="navbar-link">Избранное</Link>
      </div>
      <div id="navbar-right">
        {user ? (
          <span id="navbar-username" onClick={() => navigate('/profile')}>
            {user.username}
          </span>
        ) : (
          <span id="navbar-loginbtn" onClick={() => setShowLogin(true)}>Войти</span>
        )}
      </div>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
