// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false // Name can be optional for now, added later if needed
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store emails in lowercase
        trim: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Please use a valid email address'] // Basic email regex
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    },
    role: {
        type: String,
        enum: ['user', 'project_manager', 'admin'], // Define possible roles
        default: 'user' // Default role for new users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Mongoose Middleware: Hash Password Before Saving ---
// This 'pre-save' hook will run just before a user document is saved to the database.
userSchema.pre('save', async function(next) {
    // Only hash the password if it's new or has been modified
    if (!this.isModified('password')) {
        return next();
    }
    try {
        // Generate a salt (random string) to add to the password for hashing
        const salt = await bcrypt.genSalt(10); // 10 rounds is a good balance
        // Hash the password with the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed with saving
    } catch (error) {
        next(error); // Pass any error to the next middleware
    }
});

// --- Mongoose Method: Compare Password ---
// This method will be available on user documents to compare a plain text password
// with the stored hashed password.
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Use bcrypt's compare method to check the entered password against the hashed one
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;