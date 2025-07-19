import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import './ManagerCatalog.css';
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

  // Состояние для поиска
  const [searchParams, setSearchParams] = useState({
    booking_id: '',
    user_phone: '',
    email: '',
  });
  const [originalBookings, setOriginalBookings] = useState([]);

  useEffect(() => {
    async function fetchBookings() {
      if (user == null) return;
      try {
        const res = await fetch(`/api/libraries/${user.libraryId}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBookings(data);
        setOriginalBookings(data);
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
        const uniqueBookIds = [
          ...new Set(bookings.map((booking) => booking.book_id)),
        ];

        const bookRequests = uniqueBookIds.map(async (bookId) => {
          const res = await fetch(`/api/books/${bookId}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return [bookId, data];
        });

        const bookResults = await Promise.all(bookRequests);
        const booksMap = Object.fromEntries(bookResults);

        const booksByBookingId = {};
        bookings.forEach((booking) => {
          booksByBookingId[booking.id] = booksMap[booking.book_id];
        });

        setBooks(booksByBookingId);
      } catch (err) {
        setError(err.message);
      }
    }

    async function fetchUsers() {
      try {
        const uniqueUserIds = [
          ...new Set(bookings.map((booking) => booking.user_id)),
        ];

        const userRequests = uniqueUserIds.map(async (userId) => {
          const res = await fetch(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return [userId, data];
        });

        const userResults = await Promise.all(userRequests);
        const usersMap = Object.fromEntries(userResults);

        const usersByBookingId = {};
        bookings.forEach((booking) => {
          usersByBookingId[booking.id] = usersMap[booking.user_id];
        });

        setUsers(usersByBookingId);
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
        // Получаем уникальные ID библиотек
        const uniqueLibraryIds = [
          ...new Set(bookings.map((booking) => booking.library_id)),
        ];

        // Делаем запросы параллельно для уникальных библиотек
        const libraryRequests = uniqueLibraryIds.map(async (libraryId) => {
          const res = await fetch(`/api/libraries/${libraryId}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return [libraryId, data];
        });

        const libraryResults = await Promise.all(libraryRequests);
        const librariesMap = Object.fromEntries(libraryResults);

        // Создаем маппинг booking.id -> library data
        const librariesByBookingId = {};
        bookings.forEach((booking) => {
          librariesByBookingId[booking.id] = librariesMap[booking.library_id];
        });

        setLibraries(librariesByBookingId);
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

  // Автопоиск с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      const { booking_id, user_phone, email } = searchParams;

      // Если все параметры пустые, показываем все заказы
      if (
        booking_id.trim() === '' &&
        user_phone.trim() === '' &&
        email.trim() === ''
      ) {
        setBookings(originalBookings);
        return;
      }

      // Локальный поиск по уже загруженным данным
      const filteredBookings = originalBookings.filter((booking) => {
        let matches = true;

        // Поиск по номеру заказа
        if (booking_id.trim() !== '') {
          matches =
            matches && booking.id.toString().includes(booking_id.trim());
        }

        // Поиск по номеру телефона
        if (user_phone.trim() !== '') {
          const user = users[booking.id];
          if (user && user.phone) {
            matches = matches && user.phone.includes(user_phone.trim());
          } else {
            matches = false;
          }
        }

        // Поиск по email
        if (email.trim() !== '') {
          const user = users[booking.id];
          if (user && user.email) {
            matches =
              matches &&
              user.email.toLowerCase().includes(email.trim().toLowerCase());
          } else {
            matches = false;
          }
        }

        return matches;
      });

      setBookings(filteredBookings);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    searchParams.booking_id,
    searchParams.user_phone,
    searchParams.email,
    originalBookings,
    users,
  ]);

  function handleSearchChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  async function updateStatus(status, booking_id) {
    const res = await fetch(`/api/bookings/${booking_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
    return <p className="user__catalog-content red-error">Ошибка: {error}</p>;

  return (
    <>
      <div className="user__orders-content">
        <h1 className="user__heading">Бронирования</h1>

        {/* Поисковая форма */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="manager__orders-search-form"
        >
          <input
            type="text"
            name="booking_id"
            placeholder="Номер заказа"
            value={searchParams.booking_id}
            onChange={handleSearchChange}
            className="manager__search-bar"
          />
          <input
            type="text"
            name="user_phone"
            placeholder="Номер телефона"
            value={searchParams.user_phone}
            onChange={handleSearchChange}
            className="manager__search-bar"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={searchParams.email}
            onChange={handleSearchChange}
            className="manager__search-bar"
          />
        </form>

        <div className="user__orders-content-container">
          {bookings.map((b) => (
            <div className="user__orders-book-section" key={b.id}>
              <div className="user__orders-book">
                <img
                  className="user__orders-book-cover"
                  loading="lazy"
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
                    {users[b.id] ? (
                      <>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${users[b.id].email}`}>
                          {users[b.id].email}
                        </a>
                      </>
                    ) : (
                      <></>
                    )}
                  </p>
                  <p className="user__orders-book-detail">
                    {users[b.id] ? (
                      <>
                        <strong>Телефон:</strong>{' '}
                        <a href={`tel:${users[b.id].phone}`}>
                          {users[b.id].phone}
                        </a>
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
                  <option key={'cancelled'} value={'cancelled'}>
                    Отменить
                  </option>
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
