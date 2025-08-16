const express = require('express');
const {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    upload
} = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/projects/:projectId/tasks',
    authenticateToken,
    authorizeRoles(['project_manager', 'admin', 'user']),
    upload.array('documents', 3),
    createTask
);
router.get('/projects/:projectId/tasks', authenticateToken, getTasksByProject);
router.route('/:id')
    .get(authenticateToken, getTaskById)
    .put(authenticateToken, updateTask)
    .delete(authenticateToken, authorizeRoles(['project_manager', 'admin']), deleteTask);

module.exports = router;