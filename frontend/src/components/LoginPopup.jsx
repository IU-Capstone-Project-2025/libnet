import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterPopup from './RegisterPopup';
import './AuthPopup.css';
import { useNavigate } from 'react-router-dom';

export default function LoginPopup({ onClose, switchToRegister }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  if (showRegister) {
    return <RegisterPopup onClose={onClose} />;
  }

  async function handleLogin() {
    try {
      const res = await login(email, password);
      if (res == 'manager') {
        navigate('/manager/');
      } else if (res == 'admin') {
        navigate('/admin/');
      } else {
        navigate('/');
      }
      onClose();
    } catch (err) {
      setError(err.message); // show “incorrect email/password”
    }
  }

  return (
    <div className="user__login-overlay" onClick={onClose}>
      <div className="user__login-popup" onClick={(e) => e.stopPropagation()}>
        <h2 className="user__login-heading">Авторизация</h2>
        <h3 className="user__login-subheading">
          Чтобы войти, введите вашу почту и пароль
        </h3>
        <div className="user__login-inputs">
          <input
            className="user__login-input"
            type="email"
            placeholder="E-Mail"
            value={email}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="user__login-input"
            type="password"
            placeholder="Пароль"
            value={password}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="user__login-button-list">
          <button className="user__login-button" onClick={handleLogin}>
            Войти
          </button>
        </div>
        <h3 className="user__login-subheading">
          У вас еще нет аккаунта?{' '}
          <span className="user__login-switch" onClick={switchToRegister}>
            Создать аккаунт
          </span>
        </h3>
      </div>
    </div>
  );
}
