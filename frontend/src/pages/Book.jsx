import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function BookDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  const [favorite, setFavorite] = useState(false);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState('');

  const [title, setTitle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [description, setDescription] = useState(null);
  const [src, setSrc] = useState(null);
  const [pages, setPages] = useState(null);
  const [isbn, setIsbn] = useState(null);
  const [genre, setGenre] = useState(null);
  const [year, setYear] = useState(null);
  const [rating, setRating] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBook(data);
        setBook(data);
        setTitle(data.title);
        setAuthor(data.author);
        setDescription(data.description);
        setSrc(data.image_url);
        setPages(data.pages_count);
        setIsbn(data.isbn);
        setGenre(data.genre);
        setYear(data.year);
        setRating(data.rating);
        setPublisher(data.publisher);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book == null) return;

    async function fetchLibraries() {
      try {
        const res = await fetch(`/api/books/libraries/${book.id}`);
        const data = await res.json();
        setLibraries(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchLibraries();
  }, [book]);

  useEffect(() => {
    if (!libraries || libraries.length === 0) return;

    async function setLibs() {
      for (var i = 0; i < libraries.length; i++) {
        if (libraries[i].id == book.library_id) {
          setSelectedPlace(libraries[i].name);
          return;
        }
      }
    }
    setLibs();
  }, [libraries]);

  useEffect(() => {
    if (user == null) return;

    async function checkFavorite() {
      try {
        const res = await fetch(`/api/users/likes/${user.id}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status == '204') {
          setFavorite(false);
          // console.log('nety');
        } else {
          setFavorite(true);
          // console.log('yest?>!');
        }
      } catch (err) {
        setError(err.message);
      }
    }
    checkFavorite();
  }, [user]);

  if (loading) return <p className="user__book-content">Загружаем…</p>;
  if (error)
    return <p className="user__book-content red-error">Ошибка: {error}</p>;
  if (!book) return <p className="user__book-content">Книга не найдена.</p>;

  async function handleBooking() {
    const date = new Date();

    try {
      const lib = await fetch(`/api/libraries/${book.library_id}`);
      if (!lib.ok) throw new Error(`HTTP ${lib.status}`);
      const lib_data = await lib.json();
      console.log(book, user);
      const date_to = new Date();
      date_to.setDate(date.getDate() + lib_data.booking_duration);

      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          book_id: book.id,
          library_id: book.library_id,
          date_from: date.toISOString().slice(0, 10),
          date_to: date_to.toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
        console.log(res.statusText);
        throw new Error('Booking failed');
      } else {
        // TODO: errors
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFavorite() {
    if (!favorite) {
      try {
        const res = await fetch('/api/users/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            book_id: id,
          }),
        });

        if (!res.ok) {
          throw new Error('Favorite failed');
        } else {
          setFavorite(true);
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        const res = await fetch(`/api/users/like/${user.id}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            book_id: id,
          }),
        });

        if (!res.ok) {
          // throw new Error(res.statusText);
        } else {
          setFavorite(false);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function updateBook(libname) {
    for (var i = 0; i < libraries.length; i++) {
      if (libraries[i].name == libname) {
        console.log(libraries[i].id);
        const res = await fetch(
          `/api/libraries/isbn/${libraries[i].id}/${book.isbn}`
        );
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        navigate(`/books/${data.id}`);
      }
    }
    setSelectedPlace(libname);
  }

  return (
    <>
      <div className="user__book-content">
        <div className="user__book">
          <div className="user__book-left-section">
            <img
              className="user__book-cover"
              src={
                src ||
                'https://dhmckee.com/wp-content/uploads/2018/11/defbookcover-min.jpg'
              } //"https://via.placeholder.com/200x300?text=Book+Cover"}
              alt={`${title} cover`}
            />

            {user ? (
              <div className="user__book-buttons">
                <button className="user__book-button" onClick={handleBooking}>
                  Забронировать
                </button>
                <button className="user__book-button" onClick={handleFavorite}>
                  {favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                </button>
                <button
                  className="user__book-button user__book-button--red"
                  onClick={() => navigate(-1)}
                >
                  Назад
                </button>
              </div>
            ) : (
              <div className="user__book-buttons">
                <p className="user__book-pleaselogin">
                  Войдите, чтобы забронировать или добавить книгу в избранное
                </p>
                <button
                  className="user__book-button user__book-button--red"
                  onClick={() => navigate(-1)}
                >
                  Назад
                </button>
              </div>
            )}
          </div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <h1 className="user__book-title">{title}</h1>
              <h2 className="user__book-author">{author}</h2>
            </div>
            <p className="user__book-description">
              {description || 'Описание отсутствует'}
            </p>
            <div className="user__book-details">
              <p className="user__book-detail">
                {' '}
                <strong>Количество страниц:</strong> {pages || 'Нет информации'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Жанры:</strong> {genre || 'Нет информации'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>ISBN:</strong> {isbn || 'Нет информации'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Год выпуска:</strong> {year || 'Нет информации'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Рейтинг:</strong> {rating || 'Нет информации'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Издательство:</strong> {publisher || 'Нет информации'}
              </p>
              <select
                className="user__book-select"
                value={selectedPlace}
                onChange={(e) => updateBook(e.target.value)}
              >
                {Array.isArray(libraries) &&
                  libraries.map((lib) => (
                    <option key={lib.id} value={lib.name}>
                      {lib.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
