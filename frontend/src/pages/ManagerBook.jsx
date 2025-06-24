import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function ManagerBook() {
  const { user } = useAuth();

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
        setPages(data.pages);
        setIsbn(data.isbn);
        setGenre(data.genre);
        setYear(data.year);
        setRating(data.rating);
      } catch (err) {
        console.log("here");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  async function handleUpdate() {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            title: title,
            author: author,
            description: description,
            image_url: src,
            pages: pages,
            isbn: isbn,
            genre: genre,
            year: year,
            rating: rating,
        }),
      });
      if (res.ok) {
        console.log("updated");
      }
    } catch (e) {
        console.log(e);
    }
  }

  if (loading) return <p className="user__book-content">Загружаем…</p>;
  if (error) return <p className="user__book-content" style={{ color: 'red' }}>Ошибка: {error}</p>;
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
              } //"https://via.placeholder.com/200x300?text=Book+Cover"}
              alt={`${title} cover`}
            />
            <div className="user__book-buttons">
              <button className="manager__book-button" onClick={handleUpdate}>
                Сохранить
              </button>
            </div>
          </div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <input
                className="user__book-title manager__book-detail-input"
                placeholder='Название'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder='Автор'
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <input
                className="user__book-description manager__book-detail-input"
                placeholder='Описание'
                value={description || 'Описание отсутствует.'}
                onChange={(e) => setDescription(e.target.value)}
              />
            <div className="manager__book-details">
              <strong>Ссылка на обложку:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Ссылка на обложку'
                value={src}
                onChange={(e) => setSrc(e.target.value)}
              />
              <strong>Количество страниц:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Страницы'
                value={pages || 'Нет информации.'}
                onChange={(e) => setPages(e.target.value)}
              />
              <strong>Жанры:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Жанры'
                value={genre || 'Нет информации.'}
                onChange={(e) => setGenre(e.target.value)}
              />
              <strong>ISBN:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='ISBN'
                value={isbn || 'Нет информации.'}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <strong>Год выпуска:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Год'
                value={year || 'Нет информации.'}
                onChange={(e) => setYear(e.target.value)}
              />
              <strong>Рейтинг:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='Рейтинг'
                value={rating || 'Нет информации.'}
                onChange={(e) => setRating(e.target.value)}
              />
              <strong>В наличии:</strong>
              <input
                className="manager__book-detail-input"
                placeholder='шт'
                value={rating || 'Нет информации.'}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}