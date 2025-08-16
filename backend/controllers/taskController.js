// backend/controllers/taskController.js
const mongoose = require('mongoose');
const multer = require('multer');
const Task = require('../models/Task');
const Project = require('../models/Project'); // To ensure project exists
const User = require('../models/User'); // For populating assignee

// -------------------- Multer Setup --------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files stored in /uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only PDFs for now (you can expand if needed)
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB max
});


// -------------------- Controllers --------------------

// @desc    Create a new task within a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Authenticated Users)
const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignee } = req.body;
    const currentUserId = req.user.id; // User creating the task

    try {
        // 1. Validate input
        if (!title) {
            return res.status(400).json({ message: 'Task title is required.' });
        }

        // 2. Check if the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // 3. Prepare attachments if files were uploaded
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
                fileSize: file.size
            }));
        }

        // 4. Create the task
        const task = new Task({
            title,
            description,
            status,
            priority,
            dueDate,
            project: projectId,
            assignee,
            attachments
        });

        const createdTask = await task.save();

        // Populate assignee details if available
        const populatedTask = await Task.findById(createdTask._id)
            .populate('assignee', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error while creating task.' });
    }
};


// @desc    Get all tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignee', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks by project:', error);
        res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
};


// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignee', 'name email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ message: 'Server error while fetching task.' });
    }
};


// @desc    Get task status stats for a project
// @route   GET /api/projects/:projectId/tasks/stats
// @access  Private
const getTaskStatusStats = async (req, res) => {
    const { projectId } = req.params;

    try {
        const stats = await Task.aggregate([
            { $match: { project: new mongoose.Types.ObjectId(projectId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ message: 'Server error while fetching task statistics.' });
    }
};


// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, description, status, priority, dueDate, assignee } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate;
        task.assignee = assignee;

        // Handle new attachments if uploaded
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
                fileSize: file.size
            }));
            task.attachments.push(...newAttachments);
        }

        const updatedTask = await task.save();

        const populatedUpdatedTask = await Task.findById(updatedTask._id)
            .populate('assignee', 'name email')
            .populate('project', 'name');

        res.status(200).json(populatedUpdatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error while updating task.' });
    }
};


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Project Manager, Admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (req.user.role !== 'project_manager' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this task.' });
        }

        await task.deleteOne();
        res.status(200).json({ message: 'Task removed successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error while deleting task.' });
    }
};


module.exports = {
    upload, // export multer middleware
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
   // getTaskStatusStats
};
