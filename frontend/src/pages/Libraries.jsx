import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Libraries.css';

export default function Libraries() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLibraries() {
      try {
        const res = await fetch('/api/libraries/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLibraries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLibraries();
  }, []);

  if (loading) return <p className="user__libraries-content">Загружаем…</p>;
  if (error)
    return <p className="user__libraries-content red-error">Ошибка: {error}</p>;

  return (
    <div className="user__libraries-content">
      <h1 className="user__heading">Библиотеки</h1>
      <div className="user__libraries-list">
        {libraries.map((library) => (
          <div
            key={library.id}
            className="user__libraries-item"
            onClick={() => navigate(`/libraries/${library.id}`)}
          >
            <div className="user__libraries-item-content">
              <h3 className="user__libraries-item-title">{library.name}</h3>
              <p className="user__libraries-item-detail">
                <strong>Адрес:</strong> {library.city}, {library.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
