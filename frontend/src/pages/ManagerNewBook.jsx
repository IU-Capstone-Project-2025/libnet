import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Book.css';

export default function ManagerNewBook() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  async function handleSave() {
    if (
      title &&
      author &&
      description &&
      src &&
      pages &&
      isbn &&
      genre &&
      year &&
      rating &&
      publisher &&
      quantity
    ) {
      try {
        const res = await fetch(`/api/books/${quantity}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title,
            author: author,
            description: description,
            image_url: src,
            pages_count: Number(pages),
            isbn: isbn,
            genre: genre,
            year: Number(year),
            rating: Number(rating),
            publisher: publisher,
            library_id: Number(user.libraryId),
          }),
        });
        if (res.ok) {
          navigate('/manager/');
        }
      } catch (e) {
        setError('Произошла ошибка при создании книги');
      }
    } else {
      setError('Недостаточно данных');
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
                src ||
                'https://dhmckee.com/wp-content/uploads/2018/11/defbookcover-min.jpg'
              } //"https://via.placeholder.com/200x300?text=Book+Cover"}
              alt={`${title} cover`}
            />
            <div className="user__book-buttons">
              <button
                className="manager__book-button"
                onClick={() => navigate('/manager/')}
              >
                Назад
              </button>
              <button className="manager__book-button" onClick={handleSave}>
                Сохранить
              </button>
            </div>
          </div>
          <div className="user__book-right-section">
            <div className="user__book-title-container">
              <input
                className="user__book-title manager__book-detail-input"
                placeholder="Название"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="user__book-author manager__book-detail-input"
                placeholder="Автор"
                value={author || ''}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <input
              className="user__book-description manager__book-detail-input"
              placeholder="Описание"
              value={description || ''}
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
              <strong>Количество:</strong>
              <input
                className="manager__book-detail-input"
                placeholder="Количество"
                value={quantity || ''}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error ? (
          <p className="user__book-content red-error">Ошибка: {error}</p>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
