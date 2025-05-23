// src/pages/EditBook.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    cover_url: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`/api/books/${id}`)
      .then(res => setForm(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.put(`/api/books/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Книгу оновлено!');
      navigate('/books');
    } catch (err) {
      console.error(err);
      alert('Помилка при оновленні.');
    }
  };

  if (user?.role !== 'admin') return <p>⛔ Доступ заборонено</p>;

  return (
    <div className="container mt-4">
      <h2>Редагувати книгу</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Назва</label>
          <input type="text" name="title" value={form.title || ""} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Автор</label>
          <input type="text" name="author" value={form.author || ""} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Опис</label>
          <textarea name="description" value={form.description || ""} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Жанр</label>
          <input type="text" name="genre" value={form.genre || ""} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Обкладинка (URL)</label>
          <input type="text" name="cover_url" value={form.cover_url || ""} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Завантажити файл (pdf або txt)</label>
          <input type="file" name="file" accept=".pdf,.txt" onChange={handleFileChange} className="form-control" />
        </div>
        <button className="btn btn-primary" type="submit">Зберегти</button>
      </form>
    </div>
  );
};

export default EditBook;
