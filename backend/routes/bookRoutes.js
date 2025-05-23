// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Захищений роут — тільки для адміна додавання книги
router.post('/add', authenticateToken, authorizeRoles('admin'), bookController.addBook);

// пошук книг по API
router.get('/search', bookController.searchBooks);

//відфільтрований пошук в загальній бібліотеці
router.get('/', bookController.getFilteredBooks);

//відфільтрований пошук в бібліотеці користувача
router.get('/my-library', authenticateToken, bookController.getUserLibrary);

//додавання до бібліотеки користувача
router.post('/add-to-library', authenticateToken, bookController.addToLibrary);

//видалення книги з бібліотеки користувача
router.delete('/remove-from-library/:bookId', authenticateToken, bookController.removeFromLibrary);

// Видалення книги з бібліотеки (тільки адмін)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), bookController.deleteBook);

//повертає бібліотеку користувача
router.get('/my-library/all', authenticateToken, bookController.getMyLibrary);

//прогрес читання книги користувачем
router.patch('/update-progress', authenticateToken, bookController.updateProgress);

//додавання книжок до бібліотеки
router.get('/download', bookController.downloadBook);

// Отримання книги за ID
router.get('/:id', bookController.getBookById);

// Оновлення книги (тільки адміном можна)
router.put('/:id', authenticateToken, upload.single('file'), bookController.updateBook);

module.exports = router;