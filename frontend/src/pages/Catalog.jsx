import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Catalog.css';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/books/');

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBooks(data);
        // console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  if (loading) return <p>Загружаем…</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;

  return (
    <>
      <div className="user__catalog-content">
        <h1 className="user__heading">Каталог книг</h1>
        <div className="user__genre-section">
          <div className="user__sidebar">
            <h2 className="user__sidebar-heading">Жанры</h2>
            <ul className="user__genre-list">
              <li className="user__genre-item">
                <Link to="/" className="user__genre-link">
                  Приключения
                </Link>
              </li>
              <li className="user__genre-item">
                <Link to="/" className="user__genre-link">
                  Детектив
                </Link>
              </li>
              <li className="user__genre-item">
                <Link to="" className="user__genre-link">
                  Исторический роман
                </Link>
              </li>
              <li className="user__genre-item ">
                <Link
                  to=""
                  className="user__genre-link user__genre-item--active"
                >
                  Фантастика
                </Link>
              </li>
              <li className="user__genre-item">
                <Link to="" className="user__genre-link">
                  Фэнтези
                </Link>
              </li>
            </ul>
          </div>
          <div className="user__books-list">
            {books.map((b) => (
              <div
                key={b.id}
                className="user__book-card"
                onClick={() => navigate(`/books/${b.id}`)}
              >
                <img
                  className="user__book-cover"
                  src="https://via.placeholder.com/150x220?text=Book+Cover"
                  alt={`${b.title} cover`}
                />
                <div className="user__book-info">
                  <div className="user__book-info-text-container">
                    <strong className="user__book-info-title">{b.title}</strong>
                    <span className="user__book-info-author">{b.author}</span>
                  </div>
                  <div className="user__book-like-button">
                    <img
                      className="user__book-like-icon"
                      src="/like-2.svg"
                      alt="Лайк"
                    ></img>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
