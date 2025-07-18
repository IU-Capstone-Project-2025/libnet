import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalog.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Select from 'react-select';

export default function Catalog() {
  const Range = Slider.Range;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const [cities, setCities] = useState([]);
  const [libraries, setLibraries] = useState([]);

  const [selectedCity, setSelectedCity] = useState('');
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
      setSelectedCity(user.city);
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
    fetchCities();
  }, []);

  useEffect(() => {
    fetchLibraries(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { title, rating } = searchParams;
      const params = {};

      if (title.trim() !== '') params.title = title;
      if (rating !== '') params.rating = rating;
      if (selectedCity !== '') params.city = selectedCity;
      if (selectedLibrary !== '') params.library_id = selectedLibrary;

      if (yearFrom || yearTo) {
        const from = yearFrom.trim() !== '' ? yearFrom.trim() : '1700';
        const to = yearTo.trim() !== '' ? yearTo.trim() : '2025';
        params.year = `${from}-${to}`;
      }

      if (selectedAuthors.length > 0) {
        params.authors = selectedAuthors.map((a) => a.value).join(';');
      }

      if (selectedGenres.length > 0) {
        params.genres = selectedGenres.map((g) => g.value).join(';');
      }

      fetchBooks(params);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    searchParams.title,
    searchParams.rating,
    yearFrom,
    yearTo,
    selectedCity,
    selectedLibrary,
    selectedAuthors,
    selectedGenres,
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

  async function fetchCities() {
    try {
      const res = await fetch('/api/libraries/cities');
      if (!res.ok) throw new Error('Ошибка загрузки городов');
      const data = await res.json();
      setCities(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchLibraries(city = '') {
    try {
      let url = '/api/libraries/';
      if (city) {
        url += `?city=${encodeURIComponent(city)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Ошибка загрузки библиотек');
      const data = await res.json();
      setLibraries(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearchChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  return (
    <div className="user__catalog-content">
      <h1 className="user__heading">Каталог книг</h1>

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
            <Select
              isMulti
              isSearchable
              options={allAuthors}
              value={selectedAuthors}
              onChange={setSelectedAuthors}
              placeholder="Выберите авторов"
              className="user__react-select"
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 99999,
                  position: 'absolute',
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 99999,
                }),
              }}
              menuPortalTarget={document.body}
            />
            <Select
              isMulti
              isSearchable
              options={allGenres}
              value={selectedGenres}
              onChange={setSelectedGenres}
              placeholder="Выберите жанры"
              className="user__react-select"
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 99999,
                  position: 'absolute',
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 99999,
                }),
              }}
              menuPortalTarget={document.body}
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
              <option value="3">3+</option>
              <option value="6">6+</option>
              <option value="12">12+</option>
              <option value="16">16+</option>
              <option value="18">18+</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="user__search-filter"
            >
              <option value="">Все города</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedLibrary}
              onChange={(e) => setSelectedLibrary(e.target.value)}
              className="user__search-filter"
            >
              <option value="">Все библиотеки</option>
              {libraries.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.name}
                </option>
              ))}
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
              onClick={() => navigate(`/books/${b.id}`)}
            >
              <img
                className="user__catalog-book-cover"
                loading="lazy"
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
