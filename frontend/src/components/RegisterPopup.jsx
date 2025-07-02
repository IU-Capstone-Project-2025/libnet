import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';
import './AuthPopup.css'; 

export default function RegisterPopup({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const { register } = useAuth();
  const [error, setError] = useState(null);
  
  const [showLogin, setShowLogin] = useState(false);
  if (showLogin) {
    return <LoginPopup onClose={onClose} />;   // render LoginPopup instead
  }

  async function handleRegister() {
    try {
      await register({
       first_name: firstName,
       last_name : lastName,
       email,
       password,
       phone,
       city,
       role: 'user',          // default; let user pick if you need
     });
      onClose();
    } catch (err) {
      setError(err.message);      // show “incorrect email/password”
    }
  }

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(`/api/libraries/cities`, {
          method: 'GET',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // const unique = [...new Set(data.map(lib => lib.city))];
        setCities(data);

      } catch (err) {
        setError(err.message);
      }
    }

    fetchCities();                 // runs once
  }, []);

  return (
<div className="user__login-overlay" onClick={onClose}>
  <div className="user__login-popup" onClick={e => e.stopPropagation()}>
    <h2 className="user__login-heading">Регистрация</h2>
    <h3 className="user__login-subheading">Введите данные для создания аккаунта</h3>

    <div className="user__login-inputs">
      <input
        className="user__login-input"
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="user__login-input"
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        className="user__login-input"
        placeholder="Имя"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
      />
      <input
        className="user__login-input"
        placeholder="Фамилия"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
      />
      <input
        className="user__login-input"
        type="tel"
        placeholder="Телефон"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <select
        className="user__login-input"
        value={city}
        onChange={e => setCity(e.target.value)}
      >
        <option value="" disabled>
          {"Город"}
        </option>
        {cities.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>

    {error && <p style={{ color: 'red' }}>{error}</p>}

    <div className="user__login-checkbox-container">
      <input type="checkbox" className="user__login-checkbox" name="terms" required />
      <h3 className="user__login-terms-text">Я согласен с условиями пользования сервиса</h3>
    </div>
    
    
    <div className="user__login-button-list">
      <button className="user__login-button" onClick={handleRegister}>Зарегистрироваться</button>
    </div>

    <h3 className="user__login-subheading">
      Уже есть аккаунт? <span className="user__login-switch" onClick={() => setShowLogin(true)}>Войти</span>
    </h3>
  </div>
</div>

  );
}

