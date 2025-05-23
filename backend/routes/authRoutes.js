// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken,authorizeRoles } = require('../middleware/authMiddleware');

//реєстрація
router.post('/register', authController.register);

// авторизація
router.post('/login', authController.login);

// певний користувач
router.get('/user', authenticateToken, authController.getCurrentUser);

// список всіх користувачів
router.get('/users', authenticateToken, authorizeRoles('admin'), authController.getAllUsers);

//видалення певного користувача
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), authController.deleteUser);

module.exports = router;