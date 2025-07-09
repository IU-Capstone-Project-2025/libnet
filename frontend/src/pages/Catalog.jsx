import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Catalog.css';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    title: '',
    authors: '',
    genres: '',
    rating: '',
    year: ''
  });

  async function fetchBooks(params = {}) {
    try {
      setLoading(true);

      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v?.trim())
        )
      ).toString();

      const res = await fetch(`/api/search/?${queryString}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function handleSearchChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchBooks(searchParams);
  }

  return (
    <div className="user__catalog-content">
      <h1 className="user__heading">Каталог книг</h1>

      {/* 🔍 Search Bar */}
      <form onSubmit={handleSearchSubmit} className="user__search-form">
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={searchParams.title}
          onChange={handleSearchChange}
          className="user__search-input"
        />
        <input
          type="text"
          name="authors"
          placeholder="Авторы (через ;)"
          value={searchParams.authors}
          onChange={handleSearchChange}
          className="user__search-input"
        />
        <input
          type="text"
          name="genres"
          placeholder="Жанры (через ;)"
          value={searchParams.genres}
          onChange={handleSearchChange}
          className="user__search-input"
        />
        <input
          type="number"
          name="rating"
          placeholder="Рейтинг до"
          value={searchParams.rating}
          onChange={handleSearchChange}
          className="user__search-input"
        />
        <input
          type="text"
          name="year"
          placeholder="Год (например 2000-2020)"
          value={searchParams.year}
          onChange={handleSearchChange}
          className="user__search-input"
        />
        <button type="submit" className="user__search-button">Поиск</button>
      </form>

      {/* ⚠️ Loading/Error */}
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

      <div className="user__genre-section">
        {/* <div className="user__sidebar">
          <h2 className="user__sidebar-heading">Жанры</h2>
          <ul className="user__genre-list">
            
          </ul>
        </div> */}

        <div className="user__catalog-books-list">
          {books.map((b) => (
            <div
              key={b.id}
              className="user__catalog-book-card"
              onClick={() => navigate(`/books/${b.id}`)}
            >
              <img
                className="user__catalog-book-cover"
                src={b.image_url || "https://via.placeholder.com/150x220?text=Book+Cover"}
                alt={`${b.title} cover`}
              />
              <div className="user__catalog-book-info">
                <div className="user__catalog-book-info-text-container">
                  <strong className="user__catalog-book-info-title">{b.title}</strong>
                  <span className="user__catalog-book-info-author">{b.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
