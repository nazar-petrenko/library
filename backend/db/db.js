// backend/db/db.js
const Database = require('better-sqlite3');
const db = new Database('library.db');
const bcrypt = require('bcrypt');

// Створення таблиць (встав сюди раніше згенеровану схему з таблицями users, books і т.д.)
db.exec(`

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    cover_url TEXT,
    openlibrary_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS book_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    genre_id INTEGER,
    FOREIGN KEY(book_id) REFERENCES books(id),
    FOREIGN KEY(genre_id) REFERENCES genres(id),
    UNIQUE(book_id, genre_id)
  );

  CREATE TABLE IF NOT EXISTS book_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    format TEXT,
    file_url TEXT,
    source TEXT,
    FOREIGN KEY(book_id) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    current_page INTEGER DEFAULT 1,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id),
    UNIQUE(user_id, book_id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS user_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('wishlist', 'reading', 'finished')),
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id),
    UNIQUE(user_id, book_id)
  );

`);

// 👇 Створюємо адміна, якщо не існує
function createAdminIfNotExists() {
  const adminUsername = 'admin';
  const adminPassword = 'admin';
  const adminEmail = 'admin@example.com';
  const adminRole = 'admin';

  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(adminUsername);

  if (!existing) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(adminUsername, adminEmail, hashedPassword, adminRole);

    console.log('✅ Адміністратора створено: admin / admin');
  } else {
    console.log('ℹ️ Адміністратор уже існує');
  }
}

// Викликаємо
createAdminIfNotExists();


module.exports = db;
