// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // To fetch user details from DB

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Expected format: "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user information (id, role) to the request object
        // This makes user data available in subsequent route handlers
        req.user = decoded;
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to authorize user roles
// Takes an array of allowed roles (e.g., ['admin', 'project_manager'])
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        // Check if req.user (set by authenticateToken) exists and has a role
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied, user role not found.' });
        }

        // Check if the user's role is included in the allowed roles array
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
        }

        next(); // User has the required role, proceed
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};