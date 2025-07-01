import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Catalog.css';

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
  if (error) return <p className="user__catalog-content" style={{ color: 'red' } }>Ошибка: {error}</p>;

  return (
    <>
      <h2>Управление библиотеками</h2>
      {/* TODO: поиск
      TODO: создание */}
      <div className='manager__libraries'>
        {libraries.map((l) => (
          <button key={l.id} onClick={() => navigate(`/admin/libraries/${l.id}`)}>{l.name}</button>
        ))}
      </div>
      
    </>
  );
}
