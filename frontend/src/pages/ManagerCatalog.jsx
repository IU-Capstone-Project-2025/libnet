import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function ManagerCatalog() {
  const Range = Slider.Range;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [searchParams, setSearchParams] = useState({
    title: '',
    authors: '',
    genres: '',
    rating: '',
  });

  useEffect(() => {
    if (user) {
      // fetchLibrary();
      setSelectedLibrary(user.libraryId);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { title, authors, genres, rating } = searchParams;
      const params = {};

      if (title.trim() !== '') params.title = title;
      if (authors.trim() !== '') params.authors = authors;
      if (genres.trim() !== '') params.genres = genres;
      if (rating !== '') params.rating = rating;
      if (selectedLibrary !== '') params.library_id = selectedLibrary;

      if (yearFrom || yearTo) {
        const from = yearFrom.trim() !== '' ? yearFrom.trim() : '1700';
        const to = yearTo.trim() !== '' ? yearTo.trim() : '2025';
        params.year = `${from}-${to}`;
      }

      fetchBooks(params);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    searchParams.title,
    searchParams.authors,
    searchParams.genres,
    searchParams.rating,
    yearFrom,
    yearTo,
    selectedLibrary,
  ]);

  async function fetchBooks(params = {}) {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ''
          )
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

  return (
    <div className="user__catalog-content">
      
      <h1 className="user__heading">Каталог книг</h1>
      <button className='user__search-button manager__catalog-create-book-button' onClick={() => navigate('/manager/new')}>Добавить книгу</button>
      <form onSubmit={(e) => e.preventDefault()} className="user__search-form">
        <div className="user__search-bar-container">
          <input
            type="text"
            name="title"
            placeholder="Введите название материала"
            value={searchParams.title}
            onChange={handleSearchChange}
            className="user__search-bar"
          />
        </div>
      </form>

      <div className="user__genre-section">
        <form
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
            <div className="user__slider-container">
              <label className="user__search-label">Год издания</label>
              <Range
                min={1700}
                max={2025}
                defaultValue={[1700, 2025]}
                allowCross={false}
                onChange={([from, to]) => {
                  setYearFrom(from.toString());
                  setYearTo(to.toString());
                }}
                className="user__search-slider"
              />
              <div className="user__search-slider-values">
                <span>{yearFrom || '1700'}</span> —{' '}
                <span>{yearTo || '2025'}</span>
              </div>
            </div>

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

          </div>
        </form>

        <div className="user__catalog-books-list">
          {loading && books.length === 0 && !error && <p>Загрузка...</p>}
          {error && <p className="red-error">Ошибка: {error}</p>}
          {!loading && books.length === 0 && !error && <p>Ничего не найдено</p>}
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
  );
}
