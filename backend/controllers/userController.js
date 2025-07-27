// backend/controllers/userController.js
const User = require('../models/User'); // Import the User model

// @desc    Get all users (for populating assignee dropdowns, etc.)
// @route   GET /api/users
// @access  Private (Admin, Project Manager, or any authenticated for assignees)
const getUsers = async (req, res) => {
    try {
        // For a medium-level project, allow any authenticated user to get a list of all users
        // so they can be assigned tasks. In a more secure app, you might restrict this.
        const users = await User.find({}).select('-password'); // Fetch all users, but exclude their hashed passwords

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};

// @desc    Get user by ID (useful for profile or specific lookups)
// @route   GET /api/users/:id
// @access  Private (Admin, or self)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Basic authorization: allow admin to get any user, or a user to get their own profile
        if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
            return res.status(403).json({ message: 'Access denied to this user profile.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error while fetching user.' });
    }
};

module.exports = {
    getUsers,
    getUserById
};