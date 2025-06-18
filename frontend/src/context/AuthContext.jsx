import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const payload = jwtDecode(access_token);
        setUser({ email: payload.sub, token });
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  // Login function
  async function login(email, password) {
    console.log("Ya loh!")
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    });
    console.log(res.body)
    console.log("aboba")
    if (!res.ok) {
      throw new Error('Incorrect email or password');
    }

    const { access_token } = await res.json();
    localStorage.setItem(TOKEN_KEY, access_token);

    const payload = jwtDecode(access_token);
    setUser({ email: payload.sub, token: access_token });
  }

  // Register
  async function register(payload) {
    const res = await fetch(`/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const { detail } = await res.json().catch(() => ({}));
      throw new Error(detail ?? 'Registration failed');
    }
    await login(payload.email, payload.password);
  }

  // Logout
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
