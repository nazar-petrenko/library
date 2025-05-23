// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/users', authenticateToken, authorizeRoles('admin'), authController.getAllUsers);
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), authController.deleteUser);

module.exports = router;