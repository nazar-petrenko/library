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
    <div>
      <h2>Моя бібліотека</h2>
      {myBooks.length === 0 ? (
        <p>У вас ще немає доданих книг.</p>
      ) : (
        <div className="row">
          {myBooks.map(book => (
            <div key={book.book_id} className="col-md-4 mb-3">
              <div className="card h-100">
                <img src={book.cover_url} className="card-img-top" alt={book.title} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">{book.author}</p>
                  <Link to={`/read/${book.book_id}`} className="btn btn-success mb-2">Читати</Link>
                  <Link to={`/book/${book.book_id}`} className="btn btn-outline-primary mb-2">Деталі</Link>
                  <button className="btn btn-danger" onClick={() => handleRemove(book.book_id)}>Видалити</button>
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
