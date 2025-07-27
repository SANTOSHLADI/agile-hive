// backend/routes/authRoutes.js
const express = require('express');
const { registerOtpRequest, verifyOtp, loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register-otp-request', registerOtpRequest);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);

module.exports = router;