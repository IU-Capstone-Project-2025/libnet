import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ManagerCatalog.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Select from 'react-select';

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

  const [allGenres, setAllGenres] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
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
    fetch('/api/books/genres/')
      .then((res) => res.json())
      .then((data) => {
        console.log('Genres data:', data);
        const options = data.map((g) => ({ value: g, label: g }));
        setAllGenres(options);
      })
      .catch((err) => setError(err.message));

    fetch('/api/books/authors/')
      .then((res) => res.json())
      .then((data) => {
        console.log('Authors data:', data);
        const options = data.map((a) => ({ value: a, label: a }));
        setAllAuthors(options);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { title, rating } = searchParams;
      const params = {};

      if (title.trim() !== '') params.title = title;
      if (rating !== '') params.rating = rating;
      if (selectedLibrary !== '') params.library_id = selectedLibrary;
      if (selectedAuthors.length > 0) {
        params.authors = selectedAuthors.map((a) => a.value).join(';');
      }

      if (selectedGenres.length > 0) {
        params.genres = selectedGenres.map((g) => g.value).join(';');
      }

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
    selectedAuthors,
    selectedGenres,
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
    <div className="manager__catalog-content">
      <h1 className="manager__heading">Каталог книг</h1>
      <button
        className="manager__search-button manager__catalog-create-book-button"
        onClick={() => navigate('/manager/new')}
      >
        Добавить книгу
      </button>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="manager__search-form"
      >
        <div className="manager__search-bar-container">
          <input
            type="text"
            name="title"
            placeholder="Введите название материала"
            value={searchParams.title}
            onChange={handleSearchChange}
            className="manager__search-bar"
          />
        </div>
      </form>

      <div className="manager__genre-section">
        <form
          className={`manager__sidebar ${
            isSidebarOpen ? 'manager__sidebar--open' : ''
          }`}
        >
          <div
            className="manager__sidebar-header"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <h2 className="manager__sidebar-heading">Фильтры</h2>
            <svg
              className={`manager__sidebar-arrow ${
                isSidebarOpen ? 'manager__sidebar-arrow--up' : ''
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

          <div className="manager__sidebar-content">
            <Select
              isMulti
              isSearchable
              options={allAuthors}
              value={selectedAuthors}
              onChange={setSelectedAuthors}
              placeholder="Выберите авторов"
              className="manager__react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                menu: (base) => ({ ...base, zIndex: 99999 }),
              }}
            />
            <Select
              isMulti
              isSearchable
              options={allGenres}
              value={selectedGenres}
              onChange={setSelectedGenres}
              placeholder="Выберите жанры"
              className="manager__react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                menu: (base) => ({ ...base, zIndex: 99999 }),
              }}
            />
            <div className="manager__slider-container">
              <label className="manager__search-label">Год издания</label>
              <Range
                min={1700}
                max={2025}
                defaultValue={[1700, 2025]}
                allowCross={false}
                onChange={([from, to]) => {
                  setYearFrom(from.toString());
                  setYearTo(to.toString());
                }}
                className="manager__search-slider"
              />
              <div className="manager__search-slider-values">
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

        <div className="manager__catalog-books-list">
          {loading && books.length === 0 && !error && <p>Загрузка...</p>}
          {error && <p className="red-error">Ошибка: {error}</p>}
          {!loading && books.length === 0 && !error && <p>Ничего не найдено</p>}
          {books.map((b) => (
            <div
              key={b.id}
              className="manager__catalog-book-card"
              onClick={() => navigate(`/manager/books/${b.id}`)}
            >
              <img
                className="manager__catalog-book-cover"
                loading='lazy'
                src={
                  b.image_url ||
                  'https://via.placeholder.com/150x220?text=Book+Cover'
                }
                alt={`${b.title} cover`}
              />
              <div className="manager__catalog-book-info">
                <div className="manager__catalog-book-info-text-container">
                  <strong className="manager__catalog-book-info-title">
                    {b.title}
                  </strong>
                  <span className="manager__catalog-book-info-author">
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
