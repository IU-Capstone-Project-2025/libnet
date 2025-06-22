import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';

export default function BookDetails() {
  const {user} = useAuth();
  const [favorite, setFavorite] = useState(false);
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("");

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
        if (!res.ok) {
          if (res.status == "204") {
            setFavorite(false);
            console.log("nety");
          }
        } else {
          setFavorite(true);
          console.log("yest?>!");
        }
        
      } catch (err) {
        setError(err.message);
      }
    }
    checkFavorite();
  }, [user]);

  if (loading) return <p>Загружаем…</p>;
  if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;
  if (!book) return <p>Книга не найдена.</p>;

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
          user_id:    user.id,          
          book_id:    id,
          library_id: book.library_id,
          date_from:  date.toISOString().slice(0, 10),
          date_to: date_to.toISOString().slice(0, 10)
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
            user_id:    user.id,          
            book_id:    id,
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
            user_id:    user.id,          
            book_id:    id,
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
    <div
      style={{
        display: "flex",
        gap: "24px",
        maxWidth: "800px",
        margin: "20px auto",
        padding: "16px",
        borderRadius: "8px",
      }}
    >
      {/* Book cover on left */}
      <img
        src={book.image_url || "https://m.media-amazon.com/images/I/61HkdyBpKOL.jpg"} //"https://via.placeholder.com/200x300?text=Book+Cover"}
        alt={`${book.title} cover`}
        style={{ width: "200px", height: "300px", objectFit: "cover", borderRadius: "4px" }}
      />
      <br/>
      <button onClick={handleBooking}>Забронировать</button>

      <button onClick={handleFavorite}>{favorite ? "Удалить из избранного" : "Добавить в избранное"}</button>

      {/* Book info on right */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        <h1 style={{ marginBottom: "8px" }}>{book.title}</h1>
        <h3 style={{ marginTop: 0, color: "#555" }}>{book.author}</h3>
        <p style={{ marginTop: "16px", lineHeight: "1.5", color: "#333" }}>
          {book.description || "Описание отсутствует."}
        </p>
        <p style={{ marginTop: "16px", lineHeight: "1.5", color: "#333" }}> Количество страниц: {book.pages || "Нет информации."}</p>
        <p style={{ marginTop: "16px", lineHeight: "1.5", color: "#333" }}> Год выпуска: {book.year || "Нет информации."}</p>
        <p style={{ marginTop: "16px", lineHeight: "1.5", color: "#333" }}> Рейтинг: {book.rate || "Нет информации."}</p>
        {book.stockLocations && book.stockLocations.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <label htmlFor="stockSelect" style={{ fontWeight: "bold" }}>
              В наличии в:
            </label>
            <br />
            <select
              id="stockSelect"
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              style={{ marginTop: "8px", padding: "8px", fontSize: "16px", borderRadius: "4px" }}
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
            <p style={{ marginTop: "16px", lineHeight: "1.5", color: "#333" }}> Нет в наличии.</p>
        )}
      </div>
    </div>
  );
}
