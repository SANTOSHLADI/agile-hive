// backend/controllers/projectController.js
const Project = require('../models/Project');
const User = require('../models/User'); // Needed to get user info if populating

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Project Manager, Admin)
const createProject = async (req, res) => {
    const { name, description, endDate, members } = req.body; // 'members' array of user IDs
    const managerId = req.user.id; // Manager is the logged-in user

    try {
        // Basic validation
        if (!name || !description) {
            return res.status(400).json({ message: 'Please enter project name and description.' });
        }

        // Check if project name already exists
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            return res.status(400).json({ message: 'Project with this name already exists.' });
        }

        // Ensure the manager ID from token is added to members if not already there
        const uniqueMembers = new Set([managerId]);
        if (members && Array.isArray(members)) {
            members.forEach(memberId => uniqueMembers.add(memberId));
        }

        const project = new Project({
            name,
            description,
            endDate,
            manager: managerId, // Set the manager
            members: Array.from(uniqueMembers) // Assign initial members
        });

        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error while creating project.' });
    }
};

// @desc    Get all projects (accessible to the user)
// @route   GET /api/projects
// @access  Private (Authenticated Users)
const getProjects = async (req, res) => {
    try {
        // For a medium-level project, we'll fetch all projects
        // In a more advanced app, you'd filter by projects the user is a member of or manager of
        const projects = await Project.find({})
            .populate('manager', 'name email') // Populate manager's name and email
            .populate('members', 'name email'); // Populate members' name and email

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error while fetching projects.' });
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private (Authenticated Users)
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'name email')
            .populate('members', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // In a real app, you'd check if the logged-in user is a member/manager of this project
        // For medium level, we just ensure they are authenticated to access it.

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        res.status(500).json({ message: 'Server error while fetching project.' });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Project Manager, Admin)
const updateProject = async (req, res) => {
    const { name, description, endDate, status, members } = req.body;

    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Only manager or admin can update the project (checked by middleware, but good to double check logic)
        if (project.manager.toString() !== req.user.id && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Not authorized to update this project.' });
        }


        project.name = name || project.name;
        project.description = description || project.description;
        project.endDate = endDate || project.endDate;
        project.status = status || project.status;
        // Update members: only add new ones, remove if not in array
        if (members && Array.isArray(members)) {
            // Ensure the manager is always a member
            const uniqueMembers = new Set([project.manager.toString()]);
            members.forEach(memberId => uniqueMembers.add(memberId));
            project.members = Array.from(uniqueMembers);
        }


        const updatedProject = await project.save();
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error while updating project.' });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Authorization check handled by middleware, but adding a check here too.
        // Only admin can delete based on route definition
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete projects.' });
        }

        await project.deleteOne(); // Use deleteOne() or remove()
        res.status(200).json({ message: 'Project removed successfully.' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error while deleting project.' });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};