import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import './Navbar.css';

export default function Navbar() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const [selected, setSelected] = useState('');

  const handleUserNav = (e) => {
    const path = e.target.value;
    if (path) {
      navigate(path);
      setSelected(''); // Reset select to placeholder
    }
  };

  return (
    <>
      {user && user.role === 'manager' ? (
        <div className="manager__header">
          <div className="user__navbar-logo-container">
            <img
              className="manager__navbar-logo"
              src="/manager-logo-2x.png"
              alt="логотип"
              onClick={() => navigate('/')}
            />
          </div>
          <div className="manager__navbar">
            <Link to="/manager/" className="manager__navbar-link">
              Каталог
            </Link>
            <Link to="/manager/orders" className="manager__navbar-link">
              Заказы
            </Link>
            <Link to="/manager/library" className="manager__navbar-link">
              Библиотека
            </Link>
          </div>
          <select
            value={selected}
            onChange={handleUserNav}
            className="manager__navbar-select"
          >
            <option value="" disabled>
              Пользовательское
            </option>
            <option value="/">Каталог</option>
            <option value="/orders">Заказы</option>
            <option value="/favorites">Избранное</option>
          </select>
          <div className="manager__header-account">
            {user ? (
              <span
                className="manager__header-username"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="manager__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>
          {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
        </div>
      ) : !user || user.role === 'user' ? (
        <div className="user__header">
          <div className="user__navbar-logo-container">
            <img
              className="user__navbar-logo"
              src="/user-logo-2x.png"
              alt="логотип"
              onClick={() => navigate('/')}
            />
          </div>
          <div className="user__navbar">
            <Link to="/" className="user__navbar-link">
              Каталог
            </Link>
            <Link to="/orders" className="user__navbar-link">
              Заказы
            </Link>
            <Link to="/faq" className="user__navbar-link">
              FAQ
            </Link>
            <Link to="/favorites" className="user__navbar-link">
              Избранное
            </Link>
          </div>
          <div className="user__header-account">
            {user ? (
              <span
                className="user__header-username"
                onClick={() => navigate('/profile')}
              >
                {user.displayName}
              </span>
            ) : (
              <span
                className="user__header-login-button"
                onClick={() => setShowLogin(true)}
              >
                Войти
              </span>
            )}
          </div>
          {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
