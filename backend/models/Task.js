// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false // Description can be optional
    },
    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'done'], // Define possible task statuses
        default: 'to-do'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'], // Define possible priorities
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: false // Due date can be optional
    },
    // Reference to the Project this task belongs to
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', // Refers to the 'Project' model
        required: true
    },
    // Reference to the User assigned to this task
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: false // Task can be unassigned initially
    },
    // Attachments (array of uploaded files)
    attachments: [
        {
            fileName: {
                type: String,
                required: true
            },
            filePath: {
                type: String,
                required: true
            },
            fileType: {
                type: String,
                required: true
            },
            fileSize: {
                type: Number,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
    // Comments will be added in a separate model and referenced here later
    // or can be embedded if they are simple and always accessed with the task
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
