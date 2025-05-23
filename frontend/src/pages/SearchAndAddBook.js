import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SearchAndAddBook = () => {
  const { token } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/books/search?query=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      alert('Помилка при пошуку книги');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (book) => {
    try {
      let filePath = null;

      if (book.gutenberg_url) {
        const filename = `${book.title.replace(/\s+/g, '_')}.txt`;
        const downloadRes = await axios.get(
          `/api/books/download?url=${encodeURIComponent(book.gutenberg_url)}&filename=${encodeURIComponent(filename)}`
        );
        filePath = downloadRes.data.path;
      }

      const res = await axios.post(
        '/api/books/add',
        {
          title: book.title,
          author: book.author_name || 'Невідомо',
          description: book.description || '',
          cover_url: book.cover_url || '',
          openlibrary_id: book.id,
          genres: book.subject || [],
          file_path: filePath || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`Книга «${book.title}» додана!`);
    } catch (err) {
      console.error(err);
      alert('Не вдалося додати книгу');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">🔍 Пошук і додавання книги</h2>
      <form onSubmit={handleSearch} className="row justify-content-center mb-5">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control form-control-lg rounded-2"
            placeholder="Введіть назву книги..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-auto mt-2 mt-md-0">
          <button type="submit" className="btn btn-primary btn-lg rounded-2">Пошук</button>
        </div>
      </form>

      {loading && <p className="text-center">🔄 Завантаження...</p>}

      <div className="row">
        {results.map((book, i) => (
          <div key={i} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm rounded-2 border-0">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text text-muted">{book.author_name || 'Автор невідомий'}</p>
                {book.gutenberg_url && (
                  <small className="text-muted mb-2">
                    <a href={book.gutenberg_url} target="_blank" rel="noopener noreferrer">
                       Читати на Gutenberg
                    </a>
                  </small>
                )}
                <button
                  className="btn btn-success mt-auto rounded-pill"
                  onClick={() => handleAdd(book)}
                >
                  ➕ Додати
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchAndAddBook;
