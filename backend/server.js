// backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/authRoutes'); // NEW: Import auth routes
const projectRoutes = require('./routes/projectRoutes'); // Import project routes
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
const userRoutes = require('./routes/userRoutes'); // Import user routes


const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
const MONGO_URI = process.env.MONGO_URI; // MongoDB connection string from .env

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON body parsing for incoming requests

// Use routes
app.use('/api/auth', authRoutes); // NEW: All auth routes will be prefixed with /api/auth
app.use('/api/projects', projectRoutes); // Use project routes with /api/projects prefix
app.use('/api/tasks', taskRoutes); // Use task routes with /api/tasks prefix
app.use('/api/users', userRoutes); // Use user routes with /api/users prefix



// Basic route
app.get('/', (req, res) => {
  res.send('AgileHive Backend is running!');
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });