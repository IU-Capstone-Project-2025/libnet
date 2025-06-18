import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jwt_decode from 'jwt-decode'; // Note: we’ll use jwt_decode.default()

const AuthContext = createContext();
const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const payload = jwt_decode.default(token);
        setUser({ email: payload.sub, token });
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  // Login function
  async function login(email, password) {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    });

    if (!res.ok) {
      throw new Error('Incorrect email or password');
    }

    const { access_token } = await res.json();
    localStorage.setItem(TOKEN_KEY, access_token);

    const payload = jwt_decode.default(access_token);
    setUser({ email: payload.sub, token: access_token });
  }

  // Logout
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
