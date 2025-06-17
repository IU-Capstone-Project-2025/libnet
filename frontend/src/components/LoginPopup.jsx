import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPopup({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState(null);

  async function handleLogin() {
    try {
      await login(email, password);
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={styles.buttons}>
          <button onClick={handleLogin}>Войти</button>
          <button onClick={onClose}>Отмена</button>
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
