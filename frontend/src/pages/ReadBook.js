// src/pages/ReadBook.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ReadBook = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [book, setBook] = useState(null);

  useEffect(() => {
    axios.get(`/api/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setBook(res.data);
      if (res.data.file_url) {
        axios.get(res.data.file_url)
          .then(fileRes => {
            setContent(formatContent(fileRes.data));
          })
          .catch(() => {
            setContent('<div class="text-danger">❌ Неможливо завантажити текст книги.</div>');
          });
      } else {
        setContent('<div class="text-warning">📄 Текст книги недоступний.</div>');
      }
    })
    .catch(() => {
      setContent('<div class="text-danger">⚠️ Книгу не знайдено.</div>');
    });
  }, [id, token]);

  // Функція форматування тексту для кращої читабельності
  const formatContent = (rawText) => {
    const lines = rawText.split('\n');

    return lines.map(line => {
      const trimmed = line.trim();

      if (trimmed === '') return '<br />';
      if (/^\*\*\*/.test(trimmed)) {
        return `<div class="text-center text-secondary small my-3">${trimmed}</div>`;
      }
      if (/^CHAPTER\s+\w+/i.test(trimmed)) {
        return `<h4 class="mt-4 mb-2 text-primary">${trimmed}</h4>`;
      }
      if (/^[A-Z\d ,.'"’\-]{10,}$/.test(trimmed)) {
        return `<h5 class="mt-3 text-secondary">${trimmed}</h5>`;
      }

      return `<p>${trimmed}</p>`;
    }).join('');
  };

  return (
    <div className="container py-4">
      {book ? (
        <>
          <h2 className="mb-0">{book.title}</h2>
          <p className="text-muted mb-4">{book.author}</p>
          <div
            className="border rounded p-4 bg-light overflow-auto"
            style={{ maxHeight: '75vh', lineHeight: '1.7', fontSize: '1.1rem', fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </>
      ) : (
        <div className="text-center text-muted">Завантаження...</div>
      )}
    </div>
  );
};

export default ReadBook;
