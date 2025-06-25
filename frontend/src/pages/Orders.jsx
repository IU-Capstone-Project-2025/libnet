import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();

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
      console.log("trying");
      const res = await fetch(`/api/bookings/users/${user.id}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("bookings fetched:", data);
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
    return (
      <p className="user__catalog-content" style={{ color: 'red' }}>
        Ошибка: {error}
      </p>
    );

  // TODO: handle cancel
  async function handleCancel(booking_id) {
    console.log(booking_id);
    const res = await fetch(`/api/bookings/${booking_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: "cancelled",
          }),
        });
    if (res.ok) {
      console.log("cancelled");
    }
  }

  return (
    <>
      <div className="user__orders-content">
        <h1 className="user__heading">Ваши бронирования</h1>
        <div className="user__orders-content-container">
          {bookings.map((b) => (
            <div className="user__orders-book-section" key={b.id}>
              <div className="user__orders-book">
                <img
                  className="user__orders-book-cover"
                  src={b.image_url || "https://dhmckee.com/wp-content/uploads/2018/11/defbookcover-min.jpg"}
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
              {/* {b.status == 'pending' && (
                <button
                  className="user__orders-button user__orders-button--red"
                  onClick={() => handleCancel(b.id)}
                >
                  Отменить бронь
                </button>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
