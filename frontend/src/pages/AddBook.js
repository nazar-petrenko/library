// src/pages/AddBook.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AddBook = () => {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/books/add', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Книга додана!');
      setForm({ title: '', author: '', description: '', cover_url: '' });
    } catch (err) {
      console.error(err);
      alert('Помилка при додаванні книги');
    }
  };

  return (
    <div>
      <h2>Додати книгу</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Назва</label>
          <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Автор</label>
          <input name="author" className="form-control" value={form.author} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Опис</label>
          <textarea name="description" className="form-control" value={form.description} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>URL обкладинки</label>
          <input name="cover_url" className="form-control" value={form.cover_url} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary">Додати</button>
      </form>
    </div>
  );
};

export default AddBook;
