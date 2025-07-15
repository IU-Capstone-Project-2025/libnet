import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LibraryInfo.css';

export default function LibraryInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const res = await fetch(`/api/libraries/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLibrary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
  }, [id]);

  if (loading) return <p className="user__library-info-content">Загружаем…</p>;
  if (error)
    return (
      <p className="user__library-info-content red-error">Ошибка: {error}</p>
    );

  return (
    <div className="user__library-info-content">
      <button
        className="user__library-info-back-button"
        onClick={() => navigate('/libraries')}
      >
        К библиотекам
      </button>

      <div className="user__library-info-details">
        <h1 className="user__library-heading">{library.name}</h1>
        <h2>
          {library.city}, {library.address}
        </h2>
        <h2>{library.description || 'Описание отсутствует.'}</h2>
        <strong className="user__library-with-divider">Контакты:</strong>
        <h2>
          <a href={`tel:${library.phone}`}>{library.phone}</a>
        </h2>
        <h2>
          <a href={`mailto:${library.email}`}>{library.email}</a>
        </h2>
        <strong className="user__library-with-divider">Время Работы:</strong>
        <h2>
          {library.open_at} - {library.close_at}
        </h2>
      </div>
    </div>
  );
}
