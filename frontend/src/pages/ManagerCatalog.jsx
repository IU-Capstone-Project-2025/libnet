import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

export default function ManagerCatalog() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    async function fetchBooks() {
      try {
        const res = await fetch(`/api/libraries/${user.libraryId}/books`);
        // const res = await fetch('api/books');
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

  if (loading) return <p className="user__catalog-content"></p>;
  if (error)
    return (
      <p className="user__catalog-content red-error">
        Ошибка: {error}
      </p>
    );

  return (
    <>
      <div className="user__catalog-content">
        <h1 className="user__heading">Каталог книг</h1>
        <button className='user__search-button' onClick={() => navigate('/manager/new')}>Добавить книгу</button>
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
          <div className="user__catalog-books-list">
            {books.map((b) => (
              <div
                key={b.id}
                className="user__catalog-book-card"
                onClick={() => navigate(`/manager/books/${b.id}`)}
              >
                <img
                  className="user__catalog-book-cover"
                  src={
                    b.image_url ||
                    'https://via.placeholder.com/150x220?text=Book+Cover'
                  }
                  alt={`${b.title} cover`}
                />
                <div className="user__catalog-book-info">
                  <div className="user__catalog-book-info-text-container">
                    <strong className="user__catalog-book-info-title">
                      {b.title}
                    </strong>
                    <span className="user__catalog-book-info-author">
                      {b.author}
                    </span>
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
