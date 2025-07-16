import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';
import './AdminLibraries.css';

export default function AdminLibraries() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    async function fetchLibraries() {
      try {
        const res = await fetch('/api/libraries/');

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLibraries(data);
        // console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLibraries();
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    if (user == null) return;
    try {
      const res = await fetch(`/api/admins/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setManagers(data);
    } catch (err) {
      console.log('here');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const [newManagerEmail, setNewManagerEmail] = useState('');

  async function handleAssignAdmin() {
    if (!newManagerEmail) return;
    try {
      const res = await fetch(`/api/admins/assign/${newManagerEmail}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка при назначении');
      setNewManagerEmail('');
      await fetchAdmins(); // обновляем список
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDismissAdmin(email) {
    try {
      const res = await fetch(`/api/admins/remove/${email}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка при удалении');
      await fetchAdmins(); // обновляем список
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <p className="user__catalog-content"></p>;
  if (error)
    return <p className="user__catalog-content red-error">Ошибка: {error}</p>;

  return (
    <>
      <h1 className="user__heading">Управление библиотеками</h1>
      <div className="admin__libraries-content">
        <div className="admin__libraries-buttons">
          <button
            className="admin__book-button small-button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/admin/new');
            }}
          >
            Создать библиотеку
          </button>
        </div>
        <div className="admin__libraries-list">
          {libraries.map((l) => (
            <button
              className="admin__libraries-list-item"
              key={l.id}
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(`/admin/libraries/${l.id}`);
              }}
            >
              {l.name}
            </button>
          ))}
        </div>

        <h3 className="user__heading">Управление администраторами</h3>
        <div className="admin__assign-inputs">
          <input
            type="email"
            placeholder="E-mail пользователя"
            value={newManagerEmail}
            onChange={(e) => setNewManagerEmail(e.target.value)}
            className="admin__assign-input"
          />
          <button className="admin__assign-button" onClick={handleAssignAdmin}>
            Добавить
          </button>
        </div>

        <ul className="admin__manager-list">
          {managers.map((m) => (
            <li key={m.id} className="admin__manager-list-item">
              <span>
                {m.first_name} | {m.email}
              </span>
              {user && Number(m.id) != Number(user.id) ? (
                <button
                  onClick={() => handleDismissAdmin(m.email)}
                  className="admin__dismiss-button"
                >
                  <img src="/bin.svg" alt="Удалить" />
                </button>
              ) : (
                <></>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
