import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'access_token';
const USER_ID_KEY = 'user_id';
const USER_DATA = "user_data"

const AuthContext = createContext(null);

class User {
  constructor(id, email, firstName, lastName, role, city, phone, lib) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.city = city;
    this.phone = phone;
    this.libraryId = lib;
  }

  get displayName() {
    console.log(this.email + this.role + this.city)
    return (this.firstName && this.lastName) ? (this.firstName + " " + this.lastName) : this.email;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check localStorage and fetch user
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY);
      const userId = localStorage.getItem(USER_ID_KEY);
      const user_data = JSON.parse(localStorage.getItem(USER_DATA));
      if (user_data && user_data.firstName) {
        setUser(new User(
          user_data.id,
          user_data.email,
          user_data.firstName,
          user_data.lastName,
          user_data.role,
          user_data.city,
          user_data.phone,
          user_data.libraryId
        ));
        setLoading(false);
      }
      else if (token && userId) {
        try {
          const res = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok){
            setLoading(false);
            throw new Error('User fetch failed');
          }

          const data = await res.json();
          const loadedUser = new User(
            data.id,
            data.email,
            data.firstName,
            data.lastName,
            data.role,
            data.city,
            data.phone,
            data.libraryId
          );
          setUser(loadedUser);
          setLoading(false);
          localStorage.setItem(USER_DATA, JSON.stringify(loadedUser));
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_ID_KEY);
          localStorage.removeItem(USER_DATA)
          throw new Error('User to load user');
        }
      }
      else{
        setLoading(false);
      }
    };

    loadUser();
  }, []);

 async function login(email, password) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  });

  if (!res.ok) {
    throw new Error('Incorrect email or password');
  }

  const { access_token, user_id } = await res.json();

  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_ID_KEY, user_id.toString());
  // const payload = jwtDecode(access_token);
  const profileRes = await fetch(`/api/users/${user_id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    console.log(profileRes.json)
    setUser(new User(user_id, email, '', '', '', '', '', ''));
    setLoading(false);
    throw new Error('Could not load user profile');
  }

  const data = await profileRes.json();
  let a = new User(
      data.id,
      data.email,
      data.first_name,
      data.last_name,
      data.role,
      data.city,
      data.phone,
      data.library_id
    )
  console.log(data.library_id);
  setUser(a);
  setLoading(false);
  localStorage.setItem(USER_DATA, JSON.stringify(a));
  return data.role;
}

  async function register(payload) {
    // payload["role"] = "manager";
    const res = await fetch(`/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { detail } = await res.json().catch(() => ({}));
      setLoading(false);
      throw new Error(detail ?? 'Registration failed');
    }

    await login(payload.email, payload.password);
  }

  async function update_user(payload) {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/users/`+ user.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
       },
      body: JSON.stringify(payload),
    });
    let new_user = new User(
      user.id,
      payload.email,
      payload.first_name,
      payload.last_name,
      user.role,
      payload.city,
      payload.phone,
      user.libraryId
    )
    setUser(new_user)
    setLoading(false);
    if (!res.ok) {
      const { detail } = await res.json().catch(() => ({}));
      throw new Error(detail ?? 'Update failed');
    }
    else{
      localStorage.setItem(USER_DATA, JSON.stringify(new_user));
    }

  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setUser(null);
    setLoading(false);
    localStorage.removeItem(USER_DATA)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, update_user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
