// backend/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project'); // To ensure project exists
const User = require('../models/User'); // For populating assignee

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

        // 2. Check if the project exists and user is part of it (basic check)
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        // For medium level, we don't strictly check if current user is member
        // In a real app, you'd check `project.members.includes(currentUserId)`

        // 3. Create the task
        const task = new Task({
            title,
            description,
            status,
            priority,
            dueDate,
            project: projectId, // Link to the project
            assignee // Assignee can be null/undefined initially
        });

        const createdTask = await task.save();

        // Populate assignee details if available
        const populatedTask = await Task.findById(createdTask._id).populate('assignee', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error while creating task.' });
    }
};

// @desc    Get all tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (Authenticated Users)
const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Check if the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Fetch tasks for that project and populate assignee details
        const tasks = await Task.find({ project: projectId })
            .populate('assignee', 'name email') // Populate assignee's name and email
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks by project:', error);
        res.status(500).json({ message: 'Server error while fetching tasks.' });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private (Authenticated Users)
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name') // Populate project name
            .populate('assignee', 'name email'); // Populate assignee name and email

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // In a real app, you might check if the user has access to this task's project
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ message: 'Server error while fetching task.' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Authenticated Users)
const updateTask = async (req, res) => {
    const { title, description, status, priority, dueDate, assignee } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Basic authorization: Only the assignee, project manager, or admin can update for robust app
        // For medium level, any authenticated user can attempt update, more detailed check can be added
        // e.g., if (task.assignee.toString() !== req.user.id && req.user.role !== 'project_manager' && req.user.role !== 'admin') { ... }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate; // Allow explicit setting to null/undefined
        task.assignee = assignee; // Allow explicit setting to null/undefined

        const updatedTask = await task.save();

        // Re-populate for response
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

        // Basic authorization: Only Project Manager or Admin can delete
        // (Middleware also enforces this, but a check here adds clarity)
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
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
};