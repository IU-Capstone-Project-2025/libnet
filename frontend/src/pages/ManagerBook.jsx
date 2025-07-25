import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function ManagerBook() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const navigate = useNavigate();

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
  const [quantity, setQuantity] = useState(null);

  const libraryId = user?.libraryId;

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
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

        const qRes = await fetch(`/api/books/quantity/${libraryId}/${id}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuantity(qData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
    
  }, [id, libraryId]);

  async function handleUpdate() {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          author: author,
          description: description,
          image_url: src,
          pages_count: pages,
          isbn: isbn,
          genre: genre,
          year: year,
          rating: rating,
          publisher: publisher,
        }),
      });

      const qRes = await fetch(
        `/api/books/quantity/${libraryId}/${id}?quantity=${quantity}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok && qRes.ok) {
        // Book updated successfully
      }
    } catch (e) {
      setError('Произошла ошибка при обновлении книги');
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        navigate('/manager/');
      }
    } catch (e) {
      setError('Произошла ошибка при удалении книги');
    }
  }

  if (loading) return <p className="user__book-content">Загружаем…</p>;
  if (error)
    return <p className="user__book-content red-error">Ошибка: {error}</p>;
  if (!book) return <p className="user__book-content">Книга не найдена.</p>;

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
              }
              alt={`${title} cover`}
            />
            <div className="user__book-buttons">
              <button
                className="manager__book-button"
                onClick={() => navigate('/manager/')}
              >
                Назад
              </button>
              <button className="manager__book-button" onClick={handleDelete}>
                Удалить
              </button>
              <button className="manager__book-button" onClick={handleUpdate}>
                Сохранить
              </button>
            </div>
          </div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <input
                className="user__book-title manager__book-detail-input"
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder="Автор"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <input
              className="user__book-description manager__book-detail-input"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="manager__book-details">
              <strong>Ссылка на обложку:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Ссылка на обложку"
                value={src || ''}
                onChange={(e) => setSrc(e.target.value)}
              />
              <strong>Количество страниц:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Страницы"
                value={pages || ''}
                onChange={(e) => setPages(e.target.value)}
              />
              <strong>Жанры:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Жанры"
                value={genre || ''}
                onChange={(e) => setGenre(e.target.value)}
              />
              <strong>ISBN:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="ISBN"
                value={isbn || ''}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <strong>Год выпуска:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Год"
                value={year || ''}
                onChange={(e) => setYear(e.target.value)}
              />
              <strong>Рейтинг:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Рейтинг"
                value={rating || ''}
                onChange={(e) => setRating(e.target.value)}
              />
              <strong>Издательство:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Издательство"
                value={publisher || ''}
                onChange={(e) => setPublisher(e.target.value)}
              />
              <strong>Количество книг:</strong>
              <input
                type="number"
                className="manager__book-detail-input"
                placeholder="Количество"
                value={quantity || ''}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
