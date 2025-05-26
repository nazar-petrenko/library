// src/pages/BookDetails.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const { token } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    axios.get(`/api/books/${id}`)
      .then(res => {setBook(res.data);
      console.log('Book from backend:', res.data);})
      .catch(err => console.error(err));    
  }, [id]);

const handleAddToLibrary = async (bookId) => {
  console.log('bookId to send:', bookId);
  try {
    await axios.post('/api/books/add-to-library', { bookId }, {
      headers: { Authorization: `Bearer ${token}` ,
    'Content-Type': 'application/json', }
      
    });
    alert('Книгу додано!');
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Помилка при додаванні книги');
  }
};

  if (!book) return <p>Завантаження...</p>;

  return (
    <div className="card">
      <div className="card-body">
        <h2>{book.title}</h2>
        <p><strong>Автор:</strong> {book.author}</p>
        <img src={book.cover_url} alt={book.title} style={{ maxWidth: '200px' }} />
        <p className="mt-3"><strong>Опис:</strong> {book.description}</p>
        {user ? (
          <button onClick={() => handleAddToLibrary(book.id)} className="btn btn-success mt-2 rounded-pill">
            Додати до бібліотеки
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default BookDetails;
