// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Project names should ideally be unique
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false // Can be added later
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'], // Possible project statuses
        default: 'planning'
    },
    // Reference to the User who is the manager of this project
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    // Array of references to Users who are members of this project
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;