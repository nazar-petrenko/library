// src/pages/MyLibrary.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyLibrary = () => {
  const { token } = useContext(AuthContext);
  const [myBooks, setMyBooks] = useState([]);

  useEffect(() => {
    axios.get('/api/books/my-library', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMyBooks(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const handleRemove = async (bookId) => {
    if (!window.confirm('Видалити книгу з бібліотеки?')) return;
    try {
      await axios.delete(`/api/books/remove-from-library/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedBooks = await axios.get('/api/books/my-library', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBooks(updatedBooks.data);
    } catch (err) {
      console.error(err);
      alert('Помилка при видаленні.');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">
        <i className="bi bi-book-half me-2"></i>Моя бібліотека
      </h2>

      {myBooks.length === 0 ? (
        <div className="text-center text-muted fs-5">У вас ще немає доданих книг.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {myBooks.map(book => (
            <div key={book.book_id} className="col">
              <div className="card h-100 shadow-sm border-0">
                <img
                  src={book.cover_url}
                  className="card-img-top"
                  alt={book.title}
                  style={{ height: '300px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate" title={book.title}>{book.title}</h5>
                  <p className="card-text text-muted mb-3">{book.author}</p>
                  <div className="mt-auto">
                    <div className="btn-group w-100">
                      <Link to={`/read/${book.book_id}`} className="btn btn-success">Читати</Link>
                      <Link to={`/book/${book.book_id}`} className="btn btn-outline-primary">Деталі</Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleRemove(book.book_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
