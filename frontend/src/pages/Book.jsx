import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function BookDetails() {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState('');

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBook(data);
        if (data.stockLocations && data.stockLocations.length > 0) {
          setSelectedPlace(data.stockLocations[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (user == null) return;

    async function checkFavorite() {
      try {
        const res = await fetch(`/api/users/likes/${user.id}/${id}`);
        if (res.status == '204') {
            setFavorite(false);
            console.log('nety');
        } else {
          setFavorite(true);
          console.log('yest?>!');
        }
      } catch (err) {
        setError(err.message);
      }
    }
    checkFavorite();
  }, [user]);

  if (loading) return <p className="user__book-content">Загружаем…</p>;
  if (error) return <p className="user__book-content" style={{ color: 'red' }}>Ошибка: {error}</p>;
  if (!book) return <p className="user__book-content">Книга не найдена.</p>;

  async function handleBooking() {
    const date = new Date();

    try {
      const lib = await fetch(`/api/libraries/${book.library_id}`);
      if (!lib.ok) throw new Error(`HTTP ${lib.status}`);
      const lib_data = await lib.json();

      const date_to = new Date();
      date_to.setDate(date.getDate() + lib_data.booking_duration);

      const res = await fetch('/api/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          book_id: id,
          library_id: book.library_id,
          date_from: date.toISOString().slice(0, 10),
          date_to: date_to.toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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

  return (
    <>
      <div className="user__book-content">
        <div className="user__book">
          <div className="user__book-left-section">
            <img
              className="user__book-cover"
              src={
                book.image_url ||
                'https://m.media-amazon.com/images/I/61HkdyBpKOL.jpg'
              } //"https://via.placeholder.com/200x300?text=Book+Cover"}
              alt={`${book.title} cover`}
            />
            <div className="user__book-buttons">
              <button className="user__book-button" onClick={handleBooking}>
                Забронировать
              </button>
              <button className="user__book-button" onClick={handleFavorite}>
                {favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              </button>
            </div>
          </div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <h1 className="user__book-title">{book.title}</h1>
              <h2 className="user__book-author">{book.author}</h2>
            </div>
            <p className="user__book-description">
              {book.description || 'Описание отсутствует.'}
            </p>
            <div className="user__book-details">
              <p className="user__book-detail">
                {' '}
                <strong>Количество страниц:</strong>{' '}
                {book.pages || 'Нет информации.'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Жанры:</strong>{' '}
                {book.pages || 'Нет информации.'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>ISBN:</strong>{' '}
                {book.pages || 'Нет информации.'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Год выпуска:</strong> {book.year || 'Нет информации.'}
              </p>
              <p className="user__book-detail">
                {' '}
                <strong>Рейтинг:</strong> {book.rate || 'Нет информации.'}
              </p>
              {book.stockLocations && book.stockLocations.length > 0 && (
                <div>
                  <label htmlFor="stockSelect">В наличии в:</label>
                  <select
                    id="stockSelect"
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                  >
                    {book.stockLocations.map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(!book.stockLocations || book.stockLocations.length == 0) && (
                <p> Нет в наличии.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
