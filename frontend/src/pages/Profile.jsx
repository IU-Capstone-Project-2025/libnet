import { React, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, logout, update_user, verify, sendCode } = useAuth();
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cities, setCities] = useState([]);
  const token = localStorage.getItem('access_token');

  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);
  const [role, setRole] = useState(user.role);
  const [library, setLibrary] = useState(user.library_id);

  const [passwordChange, setPasswordChange] = useState(false);
  const [verification, setVerification] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');

  async function handleUpdate() {
    try {
      await update_user({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        city: city,
        library_id: library,
      });
      setMsg('Данные успешно обновлены');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePassword() {
    if (password != '') {
      try {
        const res = await fetch(`/api/users/${user.id}/update-password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: password,
          }),
        });
        if (res.ok) {
          setMsg('Пароль успешно изменен');
          setPasswordChange(false);
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError('Некорректные данные');
    }
  }

  async function handleVerify() {
    if (!codeSent) {
      await sendCode();
      setCodeSent(true);
    } else {
      // const enteredVerificationCode = prompt('Please enter your verification code from email ^-^');
      // console.log(enteredVerificationCode);
      try {
        await verify({ code: code });
        setVerification(false);
      } catch (err) {
        setVerification(false);
        setError('Verification failed: ' + err.message);
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
        <div className="user__profile-inputs">
          {verification ? (
            <div>
              {codeSent && (
                <>
                  <h2>Код подтверждения был отправлен вам на почту</h2>
                  <input
                    className="user__profile-input"
                    placeholder="Код подтверждения"
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </>
              )}
              <div className="user__profile-buttons">
                <button className="user__profile-button" onClick={handleVerify}>
                  {!codeSent ? 'Отправить код' : 'Подтвердить'}
                </button>
                <button
                  className="user__profile-button user__profile-button--red"
                  onClick={() => setVerification(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : passwordChange ? (
            <>
              <input
                className="user__profile-input"
                type="password"
                placeholder="Старый пароль"
                autoComplete="off"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                className="user__profile-input"
                type="password"
                placeholder="Новый пароль"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="user__profile-buttons">
                <button
                  className="user__profile-button"
                  onClick={handlePassword}
                >
                  Сохранить
                </button>
                <button
                  className="user__profile-button user__profile-button--red"
                  onClick={() => setPasswordChange(false)}
                >
                  Отмена
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                {!user.verification && (
                  <button
                    className="user__verify-button"
                    onClick={() => setVerification(true)}
                  >
                    Подтвердить аккаунт
                  </button>
                )}
              </div>
              <div className="user__profile-city">
                <label
                  className="user__profile-city-label"
                  for="user__profile-city"
                >
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
              <div className="user__profile-inputs-container">
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
              </div>
              <div className="user__profile-buttons">
                <button
                  className="user__profile-button"
                  onClick={() => setPasswordChange(true)}
                >
                  Изменить пароль
                </button>
                <button className="user__profile-button" onClick={handleUpdate}>
                  Сохранить
                </button>
                <button
                  className="user__profile-button user__profile-button--red"
                  onClick={logout}
                >
                  Выйти
                </button>
              </div>
            </>
          )}

          {msg != null ? (
            <p>{msg}</p>
          ) : error != null ? (
            <p className="red-error">Ошибка: {error}</p>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
