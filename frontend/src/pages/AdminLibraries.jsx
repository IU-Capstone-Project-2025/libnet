import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Catalog.css';
import './AdminLibraries.css';

export default function AdminLibraries() {
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
        // console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLibraries();
  }, []);

  if (loading) return <p className="user__catalog-content"></p>;
  if (error)
    return (
      <p className="user__catalog-content" style={{ color: 'red' }}>
        Ошибка: {error}
      </p>
    );

  return (
    <>
      <h1 className="user__heading">Управление библиотеками</h1>
      {/* TODO: поиск
      TODO: создание */}
      <div className="admin__libraries-content">
        <div className="admin__libraries-list">
          {libraries.map((l) => (
            <button
              className="admin__libraries-list-item"
              key={l.id}
              onClick={() => navigate(`/admin/libraries/${l.id}`)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
