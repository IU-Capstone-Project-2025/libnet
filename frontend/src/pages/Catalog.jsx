import { useEffect, useState } from "react";

export default function Catalog() {
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("http://dmosc.ru:8000/api/books/");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);         // ← empty deps = run once after first paint

  /* ---- Render ---- */
  if (loading) return <p>Загружаем…</p>;
  if (error)   return <p style={{color:"red"}}>Ошибка: {error}</p>;

  return (
    <>
      <h1>Каталог книг</h1>
      <ul id="booksList">
        {books.map(b => (
          <li key={b.id}>
            <strong>{b.title}</strong> — {b.author}
          </li>
        ))}
      </ul>
    </>
  );
}

