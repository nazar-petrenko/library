import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Замість окремих полів для username, role, email
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // Якщо є токен, отримуємо дані користувача
    if (token) {
      axios
        .get('/api/auth/user', { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          setUser(response.data); // Зберігаємо отримані дані користувача
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [token]); // Залежність від token, тому запит буде відправлений, коли токен зміниться

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      const { token } = res.data;

      setToken(token);
      localStorage.setItem('token', token);

      return true;
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const contextData = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;