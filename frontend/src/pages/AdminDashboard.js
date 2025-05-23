// src/pages/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h2>Панель адміністратора</h2>
      <ul className="list-group">
        <li className="list-group-item">
          <Link to="/admin/add-book">Додати нову книгу</Link>
        </li>
        <li className="list-group-item">
          <Link to="/books">Переглянути всі книги</Link>
        </li>
        <li className="list-group-item">
          <Link to="/users">Список користувачів</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
