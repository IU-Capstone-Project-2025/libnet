import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Favorites.css';

export default function Favorites() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [books, setBooks] = useState({});
  const [libraries, setLibraries] = useState({});

  useEffect(() => {
    if (user == null) return;

    async function fetchFavorites() {
      try {
        const res = await fetch(`/api/users/likes/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // console.log(data);
        setFavorites(data);
        // console.log(favorites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites(); // runs once
  }, [user]);

  useEffect(() => {
    if (favorites.length === 0) return;

    async function fetchBooks() {
      try {
        const entries = await Promise.all(
          favorites.map(async (favorite) => {
            const res = await fetch(`/api/books/${favorite}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return [favorite, data];
          })
        );
        setBooks(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchBooks();
  }, [favorites]);

  useEffect(() => {
    if (books.length === 0) return;

    async function fetchLibraries() {
      try {
        const entries = await Promise.all(
          Object.values(books).map(async (book) => {
            const res = await fetch(`/api/libraries/${book.library_id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return [book.id, data]; // [bookId, library]
          })
        );
        setLibraries(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchLibraries();
  }, [books]);

  if (loading) return <p className="user__book-content">Загружаем…</p>;
  if (error)
    return <p className="user__book-content red-error">Ошибка: {error}</p>;

  // Handle removing book from favorites
  async function handleRemoveFavorite(bookId) {
    try {
      const res = await fetch(`/api/users/like/${user.id}/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Remove from local state
      setFavorites((prev) => prev.filter((id) => id !== bookId));

      // Also remove from books state
      setBooks((prev) => {
        const newBooks = { ...prev };
        delete newBooks[bookId];
        return newBooks;
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  }

  return (
    <>
      <div className="user__favorites-content">
        <h1 className="user__heading">То, что Вам понравилось</h1>
        <div className="user__favorites-content-container">
          {favorites.map((f) => {
            const book = books[f];

            if (!book) {
              return (
                <div className="user__favorites-book-section" key={f}>
                  <div className="user__favorites-book">
                    <p>Loading…</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="user__favorites-book-section" key={f}>
                <div
                  className="user__favorites-book"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <img
                    className="user__favorites-book-cover"
                    src={book.image_url}
                    alt={`${book.title} cover`}
                  />

                  <div className="user__favorites-book-details">
                    <div className="user__favorites-book-title-container">
                      <p className="user__favorites-book-title">{book.title}</p>
                      <p className="user__favorites-book-author">
                        {book.author}
                      </p>
                    </div>
                    <p className="user__favorites-book-detail">
                      <strong>Год выпуска:</strong> {book.year}
                    </p>
                    <p className="user__favorites-book-detail">
                      <strong>В наличии:</strong>{' '}
                      {libraries[book.id]?.name ?? '…'}
                    </p>
                  </div>
                </div>
                <button
                  className="user__favorites-button user__favorites-button--red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(book.id);
                  }}
                >
                  Удалить
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
