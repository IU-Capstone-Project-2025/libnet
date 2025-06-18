import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';

export default function RegisterPopup({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city,   setCity]   = useState('');
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

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <input placeholder="Имя"       value={firstName} onChange={e=>setFirstName(e.target.value)} style={styles.input}/>
        <input placeholder="Фамилия"   value={lastName}  onChange={e=>setLastName(e.target.value)}  style={styles.input}/>
        <input placeholder="Телефон"   value={phone}     onChange={e=>setPhone(e.target.value)}    style={styles.input}/>
        <input placeholder="Город"     value={city}      onChange={e=>setCity(e.target.value)}     style={styles.input}/>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={styles.buttons}>
          <button onClick={handleRegister}>Зарегистрироваться</button>
          <button onClick={onClose}>Отмена</button>
          Уже есть аккаунт? <button onClick={() => setShowLogin(true)}>Войти</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popup: {
    background: 'white',
    padding: 20,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    padding: 8,
    fontSize: 16
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};
