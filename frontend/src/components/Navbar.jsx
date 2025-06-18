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
    <div class="user__header">
      <div class="user__navbar-logo-container">
        <img class="user__navbar-logo" src="../../public/user-logo-2x.png" alt="логотип" onClick={() => navigate('/')}></img>
      </div>
      <div class="user__navbar">
        <Link to="/" class="user__navbar-link">Каталог</Link>
        <Link to="/orders" class="user__navbar-link">Заказы</Link>
        <Link to="/faq" class="user__navbar-link">FAQ</Link>
        <Link to="/favorites" class="user__navbar-link">Избранное</Link>
      </div>
      <div class="user__header-account">
        {user ? (
          <span class="user__header-username" onClick={() => navigate('/profile')}>
            {user.username}
          </span>
        ) : (
          <span class="user__header-login-button" onClick={() => setShowLogin(true)}>Войти</span>
        )}
      </div>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
