// backend/controllers/bookController.js
const db = require('../db/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { searchOpenLibrary, searchGutenberg } = require('../utils/bookFetcher');

exports.addBook = (req, res) => {
  const { title, author, description, cover_url, openlibrary_id, genres, file_path } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO books (title, author, description, cover_url, openlibrary_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, author, description, cover_url, openlibrary_id);

    const bookId = result.lastInsertRowid;

    // Додати жанри (якщо є)
    if (genres && genres.length > 0) {
      genres.forEach((genreName) => {
        let genre = db.prepare(`SELECT id FROM genres WHERE name = ?`).get(genreName);
        if (!genre) {
          const insert = db.prepare(`INSERT INTO genres (name) VALUES (?)`).run(genreName);
          genre = { id: insert.lastInsertRowid };
        }
        db.prepare(`INSERT OR IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)`).run(bookId, genre.id);
      });
    }

    // Додати файл (якщо є)
    if (file_path) {
      db.prepare(`
        INSERT INTO book_files (book_id, format, file_url, source)
        VALUES (?, ?, ?, ?)
      `).run(bookId, 'txt', file_path, 'gutenberg');
    }

    res.status(201).json({ id: bookId }); // ← Повертаємо ID
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не вдалося додати книгу' });
  }
};

exports.searchBooks = async (req, res) => {
  const query = req.query.query;

  try {
    const response = await axios.get(`https://gutendex.com/books?search=${encodeURIComponent(query)}`);
    const books = response.data.results.map(book => ({
      id: book.id,
      title: book.title,
      author_name: book.authors?.[0]?.name || 'Невідомо',
      cover_url: book.formats['image/jpeg'],
      gutenberg_url: book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'],
      subject: book.subjects || [],
    }));
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не вдалося отримати дані з Gutenberg' });
  }
};

exports.addToLibrary = (req, res) => {
  console.log('user:', req.user);
  console.log('body:', req.body);
  const userId = req.user.id;
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: 'Не вказано ID книги' });
  }

  // Перевіряємо, чи така книга існує
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  if (!book) {
    return res.status(404).json({ message: 'Книгу не знайдено' });
  }

  // Перевірка, чи книга вже в бібліотеці користувача
  const alreadyExists = db
    .prepare('SELECT * FROM user_books WHERE user_id = ? AND book_id = ?')
    .get(userId, bookId);

  if (alreadyExists) {
    return res.status(400).json({ message: 'Книга вже є у вашій бібліотеці' });
  }

  // Додаємо зв'язок
  db.prepare(`
    INSERT INTO user_books (user_id, book_id, progress, added_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(userId, bookId, 0);

  res.json({ message: 'Книгу додано до вашої бібліотеки', bookId });
};

exports.deleteBook = (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Перевіряємо, чи існує книга
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Книгу не знайдено' });
  }

  // Видаляємо зв’язані записи
  db.prepare('DELETE FROM book_genres WHERE book_id = ?').run(id);
  db.prepare('DELETE FROM book_files WHERE book_id = ?').run(id);
  db.prepare('DELETE FROM user_books WHERE book_id = ?').run(id);
  db.prepare('DELETE FROM reviews WHERE book_id = ?').run(id);
  db.prepare('DELETE FROM reading_progress WHERE book_id = ?').run(id);

  // Видаляємо саму книгу
  db.prepare('DELETE FROM books WHERE id = ?').run(id);

  res.json({ message: 'Книгу успішно видалено' });
};


exports.removeFromLibrary = (req, res) => {
  const userId = req.user.id;
  const bookId = parseInt(req.params.bookId, 10);

  const existing = db.prepare(
    'SELECT * FROM user_books WHERE user_id = ? AND book_id = ?'
  ).get(userId, bookId);

  if (!existing) {
    return res.status(404).json({ message: 'Книги немає у вашій бібліотеці' });
  }

  db.prepare('DELETE FROM user_books WHERE user_id = ? AND book_id = ?')
    .run(userId, bookId);

  res.json({ message: 'Книгу видалено з вашої бібліотеки' });
};

exports.getMyLibrary = (req, res) => {
  const userId = req.user.id;

  const books = db.prepare(`
    SELECT 
      b.id AS book_id,
      b.title,
      b.author,
      b.description,
      b.cover_url,
      ub.progress,
      f.file_url
    FROM user_books ub
    JOIN books b ON ub.book_id = b.id
    LEFT JOIN book_files f ON f.book_id = b.id
    WHERE ub.user_id = ?
  `).all(userId);

  const genreStmt = db.prepare(`
    SELECT g.name FROM genres g
    JOIN book_genres bg ON bg.genre_id = g.id
    WHERE bg.book_id = ?
  `);

  const result = books.map(book => {
    const genres = genreStmt.all(book.book_id).map(g => g.name);
    return {
      ...book,
      genres
    };
  });

  res.json(result);
};

exports.updateProgress = (req, res) => {
  const userId = req.user.id;
  const { bookId, progress } = req.body;

  if (
    typeof bookId !== 'number' ||
    typeof progress !== 'number' ||
    progress < 0 || progress > 100
  ) {
    return res.status(400).json({ message: 'Некоректні дані' });
  }

  const existing = db.prepare(`
    SELECT * FROM user_books WHERE user_id = ? AND book_id = ?
  `).get(userId, bookId);

  if (!existing) {
    return res.status(404).json({ message: 'Книга не знайдена у вашій бібліотеці' });
  }

  db.prepare(`
    UPDATE user_books SET progress = ? WHERE user_id = ? AND book_id = ?
  `).run(progress, userId, bookId);

  res.json({ message: 'Прогрес оновлено' });
};

exports.getFilteredBooks = (req, res) => {
  const { title, author, genre, hasText, sort } = req.query;

  let query = `
    SELECT 
      b.id AS book_id,
      b.title,
      b.author,
      b.description,
      b.cover_url,
      f.file_url
    FROM books b
    LEFT JOIN book_files f ON f.book_id = b.id
  `;

  const conditions = [];
  const params = [];

  if (title) {
    conditions.push("b.title LIKE ?");
    params.push(`%${title}%`);
  }

  if (author) {
    conditions.push("b.author LIKE ?");
    params.push(`%${author}%`);
  }

  if (hasText === 'true') {
    conditions.push("f.file_url IS NOT NULL");
  }

  // фільтр по жанру
  if (genre) {
    query += `
      JOIN book_genres bg ON bg.book_id = b.id
      JOIN genres g ON g.id = bg.genre_id
    `;
    conditions.push("g.name = ?");
    params.push(genre);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // сортування
  if (sort === 'title') query += " ORDER BY b.title COLLATE NOCASE";
  if (sort === 'author') query += " ORDER BY b.author COLLATE NOCASE";

  const books = db.prepare(query).all(...params);

  // отримати жанри для кожної книги
  const genreStmt = db.prepare(`
    SELECT g.name FROM genres g
    JOIN book_genres bg ON bg.genre_id = g.id
    WHERE bg.book_id = ?
  `);

  const result = books.map(book => {
    const genres = genreStmt.all(book.book_id).map(g => g.name);
    return { ...book, genres };
  });

  res.json(result);
};


exports.getUserLibrary = (req, res) => {
  const userId = req.user.id;
  const { title, author, genre, progress, sort } = req.query;

  let query = `
    SELECT 
      b.id AS book_id,
      b.title,
      b.author,
      b.description,
      b.cover_url,
      f.file_url,
      ub.progress
    FROM user_books ub
    JOIN books b ON b.id = ub.book_id
    LEFT JOIN book_files f ON f.book_id = b.id
    WHERE ub.user_id = ?
  `;

  const params = [userId];
  const conditions = [];

  if (title) {
    conditions.push("b.title LIKE ?");
    params.push(`%${title}%`);
  }

  if (author) {
    conditions.push("b.author LIKE ?");
    params.push(`%${author}%`);
  }

  if (progress === 'completed') {
    conditions.push("ub.progress = 100");
  } else if (progress === 'incomplete') {
    conditions.push("ub.progress < 100");
  }

  if (genre) {
    query += `
      JOIN book_genres bg ON bg.book_id = b.id
      JOIN genres g ON g.id = bg.genre_id
    `;
    conditions.push("g.name = ?");
    params.push(genre);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  if (sort === 'title') query += " ORDER BY b.title COLLATE NOCASE";
  if (sort === 'author') query += " ORDER BY b.author COLLATE NOCASE";
  if (sort === 'progress') query += " ORDER BY ub.progress DESC";

  const books = db.prepare(query).all(...params);

  const genreStmt = db.prepare(`
    SELECT g.name FROM genres g
    JOIN book_genres bg ON bg.genre_id = g.id
    WHERE bg.book_id = ?
  `);

  const result = books.map(book => {
    const genres = genreStmt.all(book.book_id).map(g => g.name);
    return { ...book, genres };
  });

  res.json(result);
};

exports.downloadBook = async (req, res) => {
  const { url, filename } = req.query;

  if (!url || !filename) {
    return res.status(400).json({ message: 'URL або filename не вказані' });
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      res.status(200).json({ message: 'Файл збережено', path: `/uploads/${filename}` });
    });
    writer.on('error', () => {
      res.status(500).json({ message: 'Помилка при збереженні файлу' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося завантажити файл' });
  }
};

exports.getBookById = (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({ message: 'Некоректний ID книги' });
  }

  try {
    const book = db.prepare(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.description,
        b.cover_url,
        b.openlibrary_id,
        f.file_url
      FROM books b
      LEFT JOIN book_files f ON f.book_id = b.id
      WHERE b.id = ?
    `).get(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Книга не знайдена' });
    }

    const genres = db.prepare(`
      SELECT g.name FROM genres g
      JOIN book_genres bg ON g.id = bg.genre_id
      WHERE bg.book_id = ?
    `).all(bookId).map(g => g.name);

    res.json({ ...book, genres });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.updateBook = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, author, description, cover_url, genres } = req.body;

  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Книгу не знайдено' });

  // Оновлюємо основну інформацію про книгу (без file_url!)
  db.prepare(`
    UPDATE books
    SET title = ?, author = ?, description = ?, cover_url = ?
    WHERE id = ?
  `).run(title, author, description, cover_url, id);

  // Оновлюємо або створюємо запис у book_files, якщо є файл
  if (req.file) {
    const file_url = `/uploads/books/${req.file.filename}`;
    const format = req.file.mimetype === 'application/pdf' ? 'pdf' : 'txt';

    const existingFile = db.prepare('SELECT * FROM book_files WHERE book_id = ?').get(id);

    if (existingFile) {
      db.prepare(`
        UPDATE book_files
        SET file_url = ?, format = ?, source = ?
        WHERE book_id = ?
      `).run(file_url, format, 'local', id);
    } else {
      db.prepare(`
        INSERT INTO book_files (book_id, format, file_url, source)
        VALUES (?, ?, ?, ?)
      `).run(id, format, file_url, 'local');
    }
  }

  // Оновлення жанрів
  if (genres) {
    const genreList = Array.isArray(genres) ? genres : [genres];

    // Видаляємо старі зв'язки
    db.prepare('DELETE FROM book_genres WHERE book_id = ?').run(id);

    const insertGenre = db.prepare(`
      INSERT OR IGNORE INTO genres (name) VALUES (?)
    `);
    const getGenreId = db.prepare(`
      SELECT id FROM genres WHERE name = ?
    `);
    const linkGenre = db.prepare(`
      INSERT OR IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)
    `);

    genreList.forEach((name) => {
      const trimmed = name.trim();
      insertGenre.run(trimmed);
      const genreId = getGenreId.get(trimmed).id;
      linkGenre.run(id, genreId);
    });
  }

  res.json({ message: 'Книгу оновлено успішно' });
};
