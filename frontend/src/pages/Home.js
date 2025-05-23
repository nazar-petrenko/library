import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div
      className="d-flex justify-content-center align-items-center rounded-2"
      style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
      }}
    >
      <div className="card shadow-lg p-5" style={{ maxWidth: '600px', width: '90%', borderRadius: '1rem' }}>
        <div className="card-body text-center">
          <h1 className="card-title mb-4 display-5"> Онлайн Бібліотека</h1>
          <p className="card-text fs-5">Читайте класичні книги безкоштовно!</p>

          <div className="d-grid gap-2 mt-4">
            <Link to="/books" className="btn btn-primary btn-lg">
               Переглянути бібліотеку
            </Link>

            {!user && (
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                 Увійти
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
