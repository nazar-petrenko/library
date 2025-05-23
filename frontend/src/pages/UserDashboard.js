import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p className="text-center mt-5"> Завантаження даних...</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4"> Особистий кабінет</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow rounded-2 border-0">
            <div className="card-body">
              <h5 className="card-title mb-4"> Інформація про користувача</h5>
              <p className="mb-3">
                <strong> Імʼя користувача:</strong><br /> {user.username}
              </p>
              <p className="mb-3">
                <strong> Роль:</strong><br /> {user.role}
              </p>
              <p>
                <strong> Email:</strong><br /> {user.email || 'Немає'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
