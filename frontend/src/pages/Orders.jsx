import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

export default function Orders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [books, setBooks] = useState({});
  const [libraries, setLibraries] = useState({});

  async function fetchBookings() {
    try {
      const res = await fetch('/api/bookings/');

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(); // runs once
  }, []);

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
  if (error) return <p className="user__catalog-content" style={{ color: 'red' }}>Ошибка: {error}</p>;

  // TODO: handle cancel
  async function handleCancel(booking_id) {
    console.log('Cancelled ' + booking_id);
  }

  return (
    <>
      <div className="user__orders-content">
        <h1 className="user__heading">Мои заказы</h1>
        <div>
          {bookings.map((b) => (
            <div key={b.id}>
              <img
                src={b.image_url}
                alt={`${books[b.id]?.title ?? '…'} cover`}
              ></img>
              <p>{books[b.id]?.title ?? '…'}</p>
              <p>{books[b.id]?.author ?? '…'}</p>
              <p>Номер заказа: {b.id}</p>
              <p>Пункт выдачи: {libraries[b.id]?.name ?? '…'}</p>
              <p>
                {b.status == 'pending'
                  ? 'Хранится до: ' + b.date_to
                  : b.status == 'active'
                  ? 'Вернуть до: ' + b.date_to
                  : 'Возвращена'}
                {}
              </p>

              {b.status == 'pending' && (
                <button onClick={() => handleCancel(b.id)}>Отменить</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
