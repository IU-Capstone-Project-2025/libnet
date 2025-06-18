import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterPopup from './RegisterPopup';
import './LoginPopup.css'; 

export default function LoginPopup({ onClose }) {
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
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message);      // show “incorrect email/password”
    }
  }

  return (
    <div className="user__login-overlay" onClick={onClose}>
      <div className="user__login-popup" onClick={(e) => e.stopPropagation()}>
        <h2 class="user__login-heading">Авторизация</h2>
        <h3 class="user__login-subheading">Чтобы войти, введите вашу почту и пароль</h3>
        <div class="user__login-inputs">
          <input
          class="user__login-input"
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          class="user__login-input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div class="user__login-button-list">
          <button class="user__login-button" onClick={handleLogin}>Войти</button>
          {/* <button onClick={onClose}>Отмена</button> */}
        </div>
        <h3 class="user__login-subheading">У вас еще нет аккаунта? <span class="user__login-reg" onClick={() => setShowRegister(true)}>Создать аккаунт</span></h3>

      </div>
    </div>
  );
}


