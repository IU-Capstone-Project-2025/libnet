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
    <div className="user__header">
      <div className="user__navbar-logo-container">
        <img className="user__navbar-logo" src="../../public/user-logo-2x.png" alt="логотип" onClick={() => navigate('/')}></img>
      </div>
      <div className="user__navbar">
        <Link to="/" className="user__navbar-link">Каталог</Link>
        <Link to="/orders" className="user__navbar-link">Заказы</Link>
        <Link to="/faq" className="user__navbar-link">FAQ</Link>
        <Link to="/favorites" className="user__navbar-link">Избранное</Link>
      </div>
      <div className="user__header-account">
        {user ? (
          <span className="user__header-username" onClick={() => navigate('/profile')}>
            {user.username}
          </span>
        ) : (
          <span className="user__header-login-button" onClick={() => setShowLogin(true)}>Войти</span>
        )}
      </div>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
