// backend/routes/userRoutes.js
const express = require('express');
const { getUsers, getUserById } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware'); // authMiddleware is already created

const router = express.Router();

// Get all users (for dropdowns, etc.) - accessible to authenticated users
router.get('/', authenticateToken, getUsers);

// Get a specific user by ID (e.g., for profile views)
router.get('/:id', authenticateToken, getUserById); // More advanced authorization can be added in controller

module.exports = router;