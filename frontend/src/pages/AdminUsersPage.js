import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return; 

    axios.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(err => console.error('Помилка при завантаженні користувачів:', err));
  }, [token]);

  const handleDelete = (userId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      axios.delete(`/api/admin/users/${userId}`,{
         headers: {
          Authorization: `Bearer ${token}`
        }
    })
        .then(() => {
          setUsers(prev => prev.filter(user => user.id !== userId));
        })
        .catch(err => {
          console.error('Помилка при видаленні користувача:', err);
          alert('Не вдалося видалити користувача');
        });
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Список користувачів</h2>
      <div className="accordion" id="usersAccordion">
        {users.map(user => (
          <div className="accordion-item" key={user.id}>
            <h2 className="accordion-header">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${user.id}`}>
                {user.username} ({user.role})
              </button>
            </h2>
            <div id={`collapse${user.id}`} className="accordion-collapse collapse" data-bs-parent="#usersAccordion">
              <div className="accordion-body">
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
                <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Видалити</button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && <p>Користувачів не знайдено.</p>}
      </div>
    </div>
  );
};

export default AdminUsersPage;