import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Book.css';
import './AdminLibrary.css';

export default function AdminNewLibrary() {
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
  const [days, setDays] = useState("");

  async function handleSave() {
    if (title && phone && email && address && description && open && close && waiting && rent && city) {
        try {
        const res = await fetch(`/api/libraries/`, {
            method: 'POST',
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
            days_open: days,
            }),
        });
        if (res.ok) {
            navigate('/admin/');
        }
        } catch (e) {
        console.log(e);
        }
    }
    
  }

  return (
    <>
      <div className="admin__library-content">
        <h1 className="user__heading">Новая библиотека</h1>
        <div className="admin__library-details">
          <input
            className="user__book-title manager__book-detail-input"
            placeholder="Название библиотеки"
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="Номер телефона"
            value={phone || ''}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="E-mail"
            value={email || ''}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="user__book-author manager__book-detail-input"
            placeholder="Адрес"
            value={address || ''}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="user__book-description manager__book-detail-input"
            placeholder="Описание"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
          />
          <strong>Время открытия:</strong>
          <input
            className="manager__book-detail-input"
            placeholder="ЧЧ:ММ"
            value={open || ''}
            onChange={(e) => setOpen(e.target.value)}
            style={{ maxWidth: 100 + 'px' }}
          />
          <strong>Время закрытия:</strong>
          <input
            className="manager__book-detail-input"
            placeholder="ЧЧ:ММ"
            value={close || ''}
            onChange={(e) => setClose(e.target.value)}
            style={{ maxWidth: 100 + 'px' }}
          />
          <strong>Срок хранения заказов (дней):</strong>
          <input
            className="manager__book-detail-input"
            placeholder="n"
            value={waiting || ''}
            onChange={(e) => setWaiting(e.target.value)}
            style={{ maxWidth: 100 + 'px' }}
          />
          <strong>Период аренды книги (дней):</strong>
          <input
            className="manager__book-detail-input"
            placeholder="n"
            value={rent || ''}
            onChange={(e) => setRent(e.target.value)}
            style={{ maxWidth: 100 + 'px' }}
          />
          <strong>Город:</strong>
          <input
            className="manager__book-detail-input"
            placeholder="Город"
            value={city || ''}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* TODO: дни работы */}
        <button className="admin__book-button" onClick={() => navigate('/admin/')}>
                Назад
              </button>
        <button className="admin__book-button" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </>
  );
}
