import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Book.css';
import './AdminLibrary.css';

export default function AdminLibrary() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [library, setLibrary] = useState([]);
  const { id } = useParams();
  const [managers, setManagers] = useState([]);

  const [title, setTitle] = useState(null);
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState(null);
  const [address, setAddress] = useState(null);
  const [description, setDescription] = useState(null);
  const [open, setOpen] = useState(null);
  const [close, setClose] = useState(null);
  const [waiting, setWaiting] = useState(null);
  const [rent, setRent] = useState(null);
  const [city, setCity] = useState(null);
  const [daysOpen, setDaysOpen] = useState([]); // Новое состояние

  const allDays = [
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
  ];

  function toggleDay(dayKey) {
    setDaysOpen((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  }

  async function fetchManagers() {
    if (user == null) return;
    try {
      const res = await fetch(`/api/libraries/${id}/managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setManagers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchLibrary() {
      if (user == null) return;
      try {
        const res = await fetch(`/api/libraries/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLibrary(data);
        setTitle(data.name);
        setPhone(data.phone);
        setDescription(data.description);
        setEmail(data.email);
        setAddress(data.address);
        setOpen(data.open_at);
        setClose(data.close_at);
        setWaiting(data.booking_duration);
        setRent(data.rent_duration);
        setCity(data.city);
        setDaysOpen(data.days_open ? data.days_open.split(';') : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
    fetchManagers();
  }, [user]);

  async function handleUpdate() {
    try {
      const res = await fetch(`/api/libraries/${library.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: title,
          phone: phone,
          description: description,
          email: email,
          address: address,
          open_at: open,
          close_at: close,
          city: city,
          booking_duration: waiting,
          rent_duration: rent,
          days_open: daysOpen.join(';'),
        }),
      });
      if (res.ok) {
        // Library updated successfully
      }
    } catch (e) {
      setError('Произошла ошибка при обновлении библиотеки');
    }
  }

  const [newManagerEmail, setNewManagerEmail] = useState('');

  async function handleAssignManager() {
    if (!newManagerEmail) return;
    try {
      const res = await fetch(`/api/managers/assign/${newManagerEmail}/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка при назначении');
      setNewManagerEmail('');
      await fetchManagers(); // обновляем список
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDismissManager(email) {
    try {
      const res = await fetch(`/api/managers/dismiss/${email}/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка при удалении');
      await fetchManagers(); // обновляем список
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <div className="admin__library-content">
        <h1 className="user__heading">Управление библиотекой</h1>
        <div className="admin__library-details">
          <input
            className="user__book-title manager__book-detail-input"
            placeholder="Название библиотеки"
            value={title || 'Название библиотеки'}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="Номер телефона"
            value={phone || 'Номер телефона'}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="E-mail"
            value={email || 'E-mail'}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="Адрес"
            value={address || 'Адрес'}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="user__book-description manager__book-detail-input"
            placeholder="Описание"
            value={description || 'Описание отсутствует.'}
            onChange={(e) => setDescription(e.target.value)}
          />
          <strong>Время открытия:</strong>
          <input
            className="manager__book-detail-input admin__time-input"
            placeholder="ЧЧ:ММ"
            value={open || 'ЧЧ:ММ'}
            onChange={(e) => setOpen(e.target.value)}
          />
          <strong>Время закрытия:</strong>
          <input
            className="manager__book-detail-input admin__time-input"
            placeholder="ЧЧ:ММ"
            value={close || 'ЧЧ:ММ'}
            onChange={(e) => setClose(e.target.value)}
          />
          <strong>Срок хранения заказов (дней):</strong>
          <input
            className="manager__book-detail-input admin__duration-input"
            placeholder="n"
            value={waiting || 'n'}
            onChange={(e) => setWaiting(e.target.value)}
          />
          <strong>Период аренды книги (дней):</strong>
          <input
            className="manager__book-detail-input admin__duration-input"
            placeholder="n"
            value={rent || 'n'}
            onChange={(e) => setRent(e.target.value)}
          />
          <strong>Город:</strong>
          <input
            className="manager__book-detail-input"
            placeholder="Город"
            value={city || 'Нет информации.'}
            onChange={(e) => setCity(e.target.value)}
          />
          {/* Дни работы */}
          <div className="admin__working-days-section">
            <strong>Дни работы:</strong>
            <div className="admin__working-days-container">
              {allDays.map(({ key, label }) => (
                <div
                  key={key}
                  className={`day-button ${
                    daysOpen.includes(key) ? 'active' : ''
                  }`}
                  onClick={() => toggleDay(key)}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="admin__library-buttons">
          <button
            className="admin__book-button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/admin/');
            }}
          >
            Назад
          </button>
          <button className="admin__book-button" onClick={handleUpdate}>
            Сохранить
          </button>
        </div>
        <h3 className="user__heading">Управление менеджерами</h3>
        <div className="admin__assign-inputs">
          <input
            type="email"
            placeholder="E-mail пользователя"
            value={newManagerEmail}
            onChange={(e) => setNewManagerEmail(e.target.value)}
            className="admin__assign-input"
          />
          <button
            className="admin__assign-button"
            onClick={handleAssignManager}
          >
            Добавить
          </button>
        </div>

        <ul className="admin__manager-list">
          {managers.map((m) => (
            <li key={m.id} className="admin__manager-list-item">
              <span>
                {m.first_name} | {m.email}
              </span>
              <button
                onClick={() => handleDismissManager(m.email)}
                className="admin__dismiss-button"
              >
                <img src="/bin.svg" alt="Удалить" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
