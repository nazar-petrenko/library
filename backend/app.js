// backend/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const app = express();

app.use(cors());
app.use(express.json());

// Роути
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', adminRoutes);
// 404 хендлер
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
