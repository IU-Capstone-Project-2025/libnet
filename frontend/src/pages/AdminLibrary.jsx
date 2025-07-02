import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function AdminLibrary() {
    const {user} = useAuth();

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
            } catch (err) {
                console.log("here");
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        async function fetchManagers() {
            if (user == null) return;
            try {
                const res = await fetch(`/api/libraries/${id}/managers`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setManagers(data);
            } catch (err) {
                console.log("here");
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
            headers: {'Content-Type': 'application/json'},
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
            }),
        });
        if (res.ok) {
            console.log("updated");
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
                placeholder='Название библиотеки'
                value={title || 'Название библиотеки'}
                onChange={(e) => setTitle(e.target.value)}
                style={{marginBottom: 20 + 'px'}}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder='Номер телефона'
                value={phone || 'Номер телефона'}
                onChange={(e) => setPhone(e.target.value)}
                style={{marginBottom: 20 + 'px'}}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder='E-mail'
                value={email || 'E-mail'}
                onChange={(e) => setEmail(e.target.value)}
                style={{marginBottom: 20 + 'px'}}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder='Адрес'
                value={address || 'Адрес'}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <input
                className="user__book-description manager__book-detail-input"
                placeholder='Описание'
                value={description || 'Описание отсутствует.'}
                onChange={(e) => setDescription(e.target.value)}
              />
            <div className="manager__book-details">
              <strong>Время открытия:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='ЧЧ:ММ'
                value={open || 'ЧЧ:ММ'}
                onChange={(e) => setOpen(e.target.value)}
                style={{maxWidth: 100 + 'px'}}
              />
              <strong>Время закрытия:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='ЧЧ:ММ'
                value={close || 'ЧЧ:ММ'}
                onChange={(e) => setClose(e.target.value)}
                style={{maxWidth: 100 + 'px'}}
              />
              <strong>Срок хранения заказов (дней):</strong>
              <input
                className="manager__book-detail-input"
                placeholder='n'
                value={waiting || 'n'}
                onChange={(e) => setWaiting(e.target.value)}
                style={{maxWidth: 100 + 'px'}}
              />
              <strong>Период аренды книги (дней):</strong>
              <input
                className="manager__book-detail-input"
                placeholder='n'
                value={rent || 'n'}
                onChange={(e) => setRent(e.target.value)}
                style={{maxWidth: 100 + 'px'}}
              />
              <strong>Город:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Город'
                value={city || 'Нет информации.'}
                onChange={(e) => setCity(e.target.value)}
              />
              {/* TODO: дни работы */}
            </div>
            <button className="manager__book-button" onClick={handleUpdate}>
                Сохранить
              </button>
          </div>
          <div className="user__book-left-section"></div>
          </div><div>
            {managers.map((m) => (
              <div key={m.id}>{m.first_name} </div>
            ))}
          </div>
          </div>
          
        </>
    );
}