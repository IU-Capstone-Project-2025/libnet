import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [books, setBooks] = useState({});
  const [libraries, setLibraries] = useState({});

  useEffect(() => {
    async function fetchBookings() {
      if (user == null) return;
      try {
        const res = await fetch(`/api/bookings/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = [];
        if (!res.ok) {
          if (res.status === 404) {
            // Нет бронирований — это нормально, просто оставим data пустым массивом
            data = [];
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        } else {
          data = await res.json();
        }
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (bookings.length === 0) return;

    async function fetchBooks() {
      try {
        const entries = await Promise.all(
          bookings.map(async (booking) => {
            const res = await fetch(`/api/books/${booking.book_id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return [booking.id, data];
          })
        );
        setBooks(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchBooks();
  }, [bookings]);

  useEffect(() => {
    if (bookings.length === 0) return;

    async function fetchLibraries() {
      try {
        const entries = await Promise.all(
          bookings.map(async (booking) => {
            const res = await fetch(`/api/libraries/${booking.library_id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return [booking.id, data];
          })
        );
        setLibraries(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchLibraries();
  }, [bookings]);

  if (loading) return <p className="user__catalog-content"></p>;
  if (error)
    return <p className="user__catalog-content red-error">Ошибка: {error}</p>;

  async function handleCancel(booking_id) {
    const res = await fetch(`/api/bookings/${booking_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking_id ? { ...b, status: 'cancelled' } : b
        )
      );
    }
  }

  return (
    <>
      {Array.isArray(bookings) && bookings.length > 0 ? (
        <div className="user__orders-content">
          <h1 className="user__heading">Ваши бронирования</h1>
          <div className="user__orders-content-container">
            {bookings.map((b) => (
              <div className="user__orders-book-section" key={b.id}>
                <div className="user__orders-book">
                  <img
                    className="user__orders-book-cover"
                    src={
                      books[b.id]?.image_url ||
                      'https://dhmckee.com/wp-content/uploads/2018/11/defbookcover-min.jpg'
                    }
                    alt={`${books[b.id]?.title ?? '…'} cover`}
                  ></img>

                  <div className="user__orders-book-details">
                    <div className="user__orders-book-title-container">
                      <p className="user__orders-book-title">
                        {books[b.id]?.title ?? '…'}
                      </p>
                      <p className="user__orders-book-author">
                        {books[b.id]?.author ?? '…'}
                      </p>
                    </div>
                    <p className="user__orders-book-detail">
                      <strong>Номер заказа: </strong>
                      {b.id}
                    </p>
                    <p className="user__orders-book-detail">
                      <strong>Пункт выдачи:</strong>{' '}
                      {libraries[b.id]?.name ?? '…'}
                    </p>
                    <p className="user__orders-book-detail">
                      {b.status == 'pending'
                        ? 'Хранится до: ' + b.date_to
                        : b.status == 'active'
                        ? 'Вернуть до: ' + b.date_to
                        : b.status == 'cancelled'
                        ? 'Отменен'
                        : 'Возвращена'}
                      {}
                    </p>
                  </div>
                </div>
                {b.status == 'pending' && (
                  <button
                    className="user__orders-button user__orders-button--red"
                    onClick={() => handleCancel(b.id)}
                  >
                    Отменить бронь
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="user__orders-content">
          <h1 className="user__heading">У вас пока нет бронирований</h1>
        </div>
      )}
    </>
  );
}
