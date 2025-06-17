import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPopup({ onClose }) {
  const [username, setUsername] = useState('');
  const { setUser } = useAuth();

  const handleLogin = () => {
    if (username.trim()) {
      setUser({ username });
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
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
