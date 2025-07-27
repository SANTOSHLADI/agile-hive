// backend/routes/projectRoutes.js
const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// Routes for projects
// Protect these routes with authentication middleware
// Only 'project_manager' or 'admin' roles can create, update, delete projects
router.route('/')
    .post(authenticateToken, authorizeRoles(['project_manager', 'admin']), createProject)
    .get(authenticateToken, getProjects); // All authenticated users can get projects

router.route('/:id')
    .get(authenticateToken, getProjectById)
    .put(authenticateToken, authorizeRoles(['project_manager', 'admin']), updateProject)
    .delete(authenticateToken, authorizeRoles(['admin']), deleteProject); // Only admin can delete for simplicity

module.exports = router;