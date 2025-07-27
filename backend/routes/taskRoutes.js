// backend/routes/taskRoutes.js
const express = require('express');
const {
    createTask,
    getTasksByProject, // Get all tasks for a specific project
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for tasks
// Protecting all task routes with authentication
// Creating a task requires manager/admin role (or custom logic if any member can create)
router.post('/projects/:projectId/tasks', authenticateToken, authorizeRoles(['project_manager', 'admin', 'user']), createTask); // Allow users to create tasks too
router.get('/projects/:projectId/tasks', authenticateToken, getTasksByProject); // Get tasks for a specific project

router.route('/:id') // For operations on a specific task ID
    .get(authenticateToken, getTaskById)
    .put(authenticateToken, updateTask) // All authenticated users can update their assigned tasks
    .delete(authenticateToken, authorizeRoles(['project_manager', 'admin']), deleteTask); // Only manager/admin can delete tasks

module.exports = router;