import { React, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, logout, update_user } = useAuth();
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);

  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);
  const [role, setRole] = useState(user.role);
  const [library, setLibrary] = useState(user.library_id);

  async function handleUpdate() {
    if (password != '') {
      try {
        await update_user({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          phone: phone,
          city: city,
          library_id: library,
        });
        // onClose();
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        await update_user({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          city: city,
          library_id: library,
        });
        // onClose();
      } catch (err) {
        setError(err.message);
      }
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

    fetchCities(); // runs once
  }, []);

  return (
    <>
      <div className="user__profile-content">
        <div className="user__profile-city">
          <label className="user__profile-city-label" for="user__profile-city">
            Выберите город:
          </label>
          <select
            className="user__profile-city-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="" disabled>
              {'Город'}
            </option>
            {Array.isArray(cities) &&
              cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        <div className="user__profile-inputs">
          <input
            className="user__profile-input"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="user__profile-input"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="user__profile-input"
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="user__profile-input"
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="user__profile-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* {role == "manager" && (
            <input
            className="user__profile-input"
            placeholder="Библиотека"
            value={library}
            onChange={(e) => setLibrary(e.target.value)}
          />
          )} */}
        </div>
        <div className="user__profile-buttons">
          <button className="user__profile-button" onClick={handleUpdate}>
            Сохранить
          </button>
          <button
            className="user__profile-button user__profile-button--red"
            onClick={logout}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </>
  );
}
