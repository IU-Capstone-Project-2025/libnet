import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import { useAuth } from '../context/AuthContext';

export default function ManagerOrders() {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [books, setBooks] = useState({});
  const [users, setUsers] = useState({});
  const [libraries, setLibraries] = useState({});

  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    async function fetchBookings() {
      if (user == null) return;
      try {
        console.log('trying');
        const res = await fetch(`/api/libraries/${user.libraryId}/bookings`,
          {headers: {Authorization: `Bearer ${token}`,}}
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log('bookings fetched:', data);
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

    async function fetchUsers() {
      try {
        const entries = await Promise.all(
          bookings.map(async (booking) => {
            const res = await fetch(`/api/users/${booking.user_id}`,
              {headers: {Authorization: `Bearer ${token}`,}}
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return [booking.id, data];
          })
        );
        setUsers(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      }
    }

    fetchUsers();
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

    async function allocateStatuses() {
      const updatedStatuses = {};

      for (let i = 0; i < bookings.length; i++) {
        const status = bookings[i].status;
        updatedStatuses[bookings[i].id] =
          status === 'pending'
            ? 'В ожидании'
            : status === 'active'
            ? 'В аренде'
            : status === 'returned'
            ? 'Возвращена'
            : 'Отменён';
      }

      setStatuses(updatedStatuses);
    }

    fetchLibraries();
    allocateStatuses();
  }, [bookings]);

  async function updateStatus(status, booking_id) {
    const res = await fetch(`/api/bookings/${booking_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
      body: JSON.stringify({
        status: status,
      }),
    });
    const updatedBooking = await res.json();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking_id
          ? {
              ...b,
              status: updatedBooking.status,
              date_to: updatedBooking.date_to,
            }
          : b
      )
    );

    setStatuses((prev) => ({
      ...prev,
      [booking_id]:
        status === 'pending'
          ? 'В ожидании'
          : status === 'active'
          ? 'В аренде'
          : status === 'returned'
          ? 'Возвращена'
          : 'Отменён',
    }));
  }

  if (loading) return <p className="user__catalog-content"></p>;
  if (error)
    return (
      <p className="user__catalog-content" style={{ color: 'red' }}>
        Ошибка: {error}
      </p>
    );

  return (
    <>
      <div className="user__orders-content">
        <h1 className="user__heading">Бронирования</h1>
        <div className="user__orders-content-container">
          {bookings.map((b) => (
            <div className="user__orders-book-section" key={b.id}>
              <div className="user__orders-book">
                <img
                  className="user__orders-book-cover"
                  src={
                    b.image_url ||
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
                    {users[b.id] ? (
                      <>
                        <strong>Заказчик:</strong>{' '}
                        {users[b.id].first_name + ' ' + users[b.id].last_name}
                      </>
                    ) : (
                      <></>
                    )}
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
              {b.status == 'pending' || b.status == 'active' ? (
                <select
                  className="user__orders-button user__orders-button--red"
                  value={b.status}
                  onChange={(e) => updateStatus(e.target.value, b.id)}
                >
                  <option key={'default'} value="" disabled>
                    {statuses[b.id]}
                  </option>
                  <option key={'pending'} value={'pending'}>
                    В ожидании
                  </option>
                  <option key={'active'} value={'active'}>
                    В аренде
                  </option>
                  <option key={'returned'} value={'returned'}>
                    Возвращена
                  </option>
                  {/* <option key={"cancelled"} value={"cancelled"}>
                    Отменён
                  </option> */}
                </select>
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
