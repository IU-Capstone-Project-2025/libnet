import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function ManagerLibrary() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [library, setLibrary] = useState([]);

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
    setDaysOpen(prev =>
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    );
  }

  useEffect(() => {
    async function fetchLibrary() {
      if (user == null) return;
      try {
        const res = await fetch(`/api/libraries/${user.libraryId}`);
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
        console.log('updated');
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <div className="user__book-content">
        <div className="user__book">
          <div className="user__book-left-section"></div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <input
                className="user__book-title manager__book-detail-input"
                placeholder="Название библиотеки"
                value={title || 'Название библиотеки'}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: 20 + 'px' }}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder="Номер телефона"
                value={phone || 'Номер телефона'}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginBottom: 20 + 'px' }}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder="E-mail"
                value={email || 'E-mail'}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 20 + 'px' }}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder="Адрес"
                value={address || 'Адрес'}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <input
              className="user__book-description manager__book-detail-input"
              placeholder="Описание"
              value={description || 'Описание отсутствует.'}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="manager__book-details">
              <strong>Время открытия:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="ЧЧ:ММ"
                value={open || 'ЧЧ:ММ'}
                onChange={(e) => setOpen(e.target.value)}
                style={{ maxWidth: 100 + 'px' }}
              />
              <strong>Время закрытия:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="ЧЧ:ММ"
                value={close || 'ЧЧ:ММ'}
                onChange={(e) => setClose(e.target.value)}
                style={{ maxWidth: 100 + 'px' }}
              />
              <strong>Срок хранения заказов (дней):</strong>
              <input
                className="manager__book-detail-input"
                placeholder="n"
                value={waiting || 'n'}
                onChange={(e) => setWaiting(e.target.value)}
                style={{ maxWidth: 100 + 'px' }}
              />
              <strong>Период аренды книги (дней):</strong>
              <input
                className="manager__book-detail-input"
                placeholder="n"
                value={rent || 'n'}
                onChange={(e) => setRent(e.target.value)}
                style={{ maxWidth: 100 + 'px' }}
              />
              <strong>Город:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Город"
                value={city || 'Нет информации.'}
                onChange={(e) => setCity(e.target.value)}
              />

              {/* Дни работы */}
              <div style={{ marginTop: '15px' }}>
                <strong>Дни работы:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {allDays.map(({ key, label }) => (
                    <div
                      key={key}
                      className={`day-button ${daysOpen.includes(key) ? 'active' : ''}`}
                      onClick={() => toggleDay(key)}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="manager__book-button" onClick={handleUpdate}>
              Сохранить
            </button>
          </div>
          <div className="user__book-left-section"></div>
        </div>
      </div>
    </>
  );
}
