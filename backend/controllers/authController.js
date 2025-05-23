// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = (req, res) => {
  const { username, email, password } = req.body;

  const userExists = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(username, email);

  if (userExists) {
    return res.status(400).json({ message: 'Користувач вже існує' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
  );
  const info = stmt.run(username, email, hashedPassword);

  res.status(201).json({ message: 'Успішна реєстрація', userId: info.lastInsertRowid });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ message: 'Невірне ім’я користувача або пароль' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Невірне ім’я користувача або пароль' });
  }
  console.log('JWT_SECRET is:', JWT_SECRET);
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
};

exports.getCurrentUser = (req, res) => {
  const userId = req.user.id;

  const user = db.prepare('SELECT id, username, role, email FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ message: 'Користувача не знайдено' });
  }

  res.json(user);
};

exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all(); // <- потрібно .all()
    res.json(users);
  } catch (err) {
    console.error('Помилка при отриманні користувачів:', err);
    res.status(500).json({ error: 'Не вдалося завантажити користувачів' });
  }
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'Користувача видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не вдалося видалити користувача' });
  }
};