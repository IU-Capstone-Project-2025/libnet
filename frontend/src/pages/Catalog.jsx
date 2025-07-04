import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Catalog.css';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    title: '',
    authors: '',
    genres: '',
    rating: '',
    year: '',
  });

  async function fetchBooks(params = {}) {
    try {
      setLoading(true);

      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v?.trim()))
      ).toString();

      const res = await fetch(`/api/books/?${queryString}`);

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
      <form onSubmit={handleSearchSubmit} className="user__search-form">
        <div className="user__search-bar-container">
          <input
            type="text"
            name="title"
            placeholder="Введите название материала"
            value={searchParams.title}
            onChange={handleSearchChange}
            className="user__search-bar"
          />
          <button type="submit" className="user__search-button">
            Поиск
          </button>
        </div>
      </form>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

      <div className="user__genre-section">
        <form
          onSubmit={handleSearchSubmit}
          className={`user__sidebar ${
            isSidebarOpen ? 'user__sidebar--open' : ''
          }`}
        >
          <div
            className="user__sidebar-header"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <h2 className="user__sidebar-heading">Фильтры</h2>
            <svg
              className={`user__sidebar-arrow ${
                isSidebarOpen ? 'user__sidebar-arrow--up' : ''
              }`}
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="user__sidebar-content">
            <input
              type="text"
              name="authors"
              placeholder="Авторы (через ;)"
              value={searchParams.authors}
              onChange={handleSearchChange}
              className="user__search-filter"
            />
            <input
              type="text"
              name="genres"
              placeholder="Жанры (через ;)"
              value={searchParams.genres}
              onChange={handleSearchChange}
              className="user__search-filter"
            />
            <input
              type="number"
              name="rating"
              placeholder="Рейтинг"
              value={searchParams.rating}
              onChange={handleSearchChange}
              className="user__search-filter"
            />
            <input
              type="text"
              name="year"
              placeholder="Год"
              value={searchParams.year}
              onChange={handleSearchChange}
              className="user__search-filter"
            />
          </div>
        </form>

        <div className="user__catalog-books-list">
          {books.map((b) => (
            <div
              key={b.id}
              className="user__catalog-book-card"
              onClick={() => navigate(`/books/${b.id}`)}
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
  );
}
