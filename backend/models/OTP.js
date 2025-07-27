// backend/models/OTP.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // TTL index: Document will expire and be deleted after 600 seconds (10 minutes)
    }
});

// Create a unique index on email to ensure only one pending OTP per email
otpSchema.index({ email: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;