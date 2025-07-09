import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Catalog.css';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const [searchParams, setSearchParams] = useState({
    title: '',
    authors: '',
    genres: '',
    rating: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks(params = {}) {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
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

  function handleSearchChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  function handleTitleSearch(e) {
    e.preventDefault();
    fetchBooks({ title: searchParams.title });
  }

  function handleFilterSearch(e) {
    e.preventDefault();
    const { authors, genres, rating } = searchParams;
    const params = { authors, genres, rating };

    if (yearFrom || yearTo) {
      const from = yearFrom.trim() !== '' ? yearFrom.trim() : '0';
      const to = yearTo.trim() !== '' ? yearTo.trim() : '3000';
      params.year = `${from}-${to}`;
    }

    fetchBooks(params);
  }

  return (
    <div className="user__catalog-content">
      <h1 className="user__heading">Каталог книг</h1>

      <form onSubmit={handleTitleSearch} className="user__search-form">
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
      {error && <p className="red-error">Ошибка: {error}</p>}

      <div className="user__genre-section">
        <form
          onSubmit={handleFilterSearch}
          className={`user__sidebar ${isSidebarOpen ? 'user__sidebar--open' : ''}`}
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
              type="text"
              placeholder="От года"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="user__search-filter"
            />
            <input
              type="text"
              placeholder="До года"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="user__search-filter"
            />
            <select
              name="rating"
              value={searchParams.rating}
              onChange={handleSearchChange}
              className="user__search-filter"
            >
              <option value="">Все возрасты</option>
              <option value="0">0+</option>
              <option value="3">3+</option>
              <option value="6">6+</option>
              <option value="12">12+</option>
              <option value="16">16+</option>
              <option value="18">18+</option>
            </select>

            <button type="submit" className="user__search-filter filter-button">
              Применить
            </button>
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
                  b.image_url || 'https://via.placeholder.com/150x220?text=Book+Cover'
                }
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
