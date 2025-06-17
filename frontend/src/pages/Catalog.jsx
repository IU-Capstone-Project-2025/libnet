import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Catalog() {
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books/");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBooks(data);
        console.log(data)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);         

  if (loading) return <p>Загружаем…</p>;
  if (error)   return <p style={{color:"red"}}>Ошибка: {error}</p>;

  return (
    <>
      <h1>Каталог книг</h1>
      <div id="booksList" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {books.map((b) => (
          <div
            key={b.id}
            className="book-card"
            onClick={() => navigate(`/books/${b.id}`)}
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              width: "200px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            
            <img
              src="https://via.placeholder.com/150x220?text=Book+Cover"
              alt={`${b.title} cover`}
              style={{ width: "150px", height: "220px", objectFit: "cover", marginBottom: "12px", borderRadius: "4px" }}
            />
            <strong style={{ textAlign: "center" }}>{b.title}</strong>
            <span style={{ color: "#555", marginTop: "4px" }}>{b.author}</span>
          </div>
        ))}
      </div>
    </>
  );
}

