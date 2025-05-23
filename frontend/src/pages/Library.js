// src/pages/Library.js
import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Library = () => {
  const [books, setBooks] = useState([]);
  const { user, token } = useContext(AuthContext); 

  useEffect(() => {
    axios.get('/api/books')  
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю книгу?')) return;
    try {
      await axios.delete(`/api/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBooks(prev => prev.filter(book => book.book_id !==   id));
    } catch (error) {
      console.error('Помилка при видаленні:', error);
      alert('Не вдалося видалити книгу');
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Бібліотека</h2>
      <div className="row">
        {books.length === 0 ? (
          <p className="text-center">Книг поки немає.</p>
        ) : (
          books.map(book => (
            <div key={book.book_id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm rounded-2 border-0">
                {book.cover_url && (
                  <img
                    src={book.cover_url}
                    className="card-img-top rounded-top-2"
                    alt={book.title}
                    style={{ objectFit: 'cover', height: '300px' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text text-muted">{book.author}</p>
                  <Link to={`/book/${book.book_id}`} className="btn btn-outline-primary mt-auto rounded-pill">
                    Деталі
                  </Link>

                  {user?.role === 'admin' && (<>
                    <Link
                      to={`/admin/edit-book/${book.book_id}`}
                      className="btn btn-warning mt-2 rounded-pill"
                    >
                      Редагувати
                    </Link>
                    <button
                      onClick={() => handleDelete(book.book_id)}
                      className="btn btn-danger mt-2 rounded-pill"
                    >
                     Видалити
                    </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
