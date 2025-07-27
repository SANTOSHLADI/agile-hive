// backend/controllers/authController.js
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // For JWT token generation

// --- Helper function to generate JWT token ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d' // Token expires in 1 day
    });
};

// --- Nodemailer Transporter Setup ---
// You'll need to configure this with your email service provider credentials
const transporter = nodemailer.createTransport({
    service: 'gmail', // Example: 'gmail' or 'outlook' or your SMTP host
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS // Your email password/app password from .env
    }
});

// @desc    Request OTP for user registration
// @route   POST /api/auth/register-otp-request
// @access  Public
const registerOtpRequest = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // 2. Delete any old OTPs for this email to avoid confusion
        await OTP.deleteMany({ email });

        // 3. Generate OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true // Ensure only digits for simplicity
        });

        // 4. Save OTP to database
        const newOtpRecord = new OTP({ email, otp });
        await newOtpRecord.save();

        // 5. Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'AgileHive: Your OTP for Registration',
            html: `
                <p>Dear User,</p>
                <p>Your One-Time Password (OTP) for AgileHive registration is:</p>
                <h2 style="color: #007bff;">${otp}</h2>
                <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thanks,<br/>The AgileHive Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                // Even if email fails, we might still want to proceed if OTP is saved
                // For production, you might want more robust error handling here.
                return res.status(500).json({ message: 'OTP generated, but failed to send email. Please check server logs.' });
            }
            console.log('OTP Email sent:', info.response);
            res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
        });

    } catch (error) {
        console.error('Error in registerOtpRequest:', error);
        res.status(500).json({ message: 'Server error during OTP request.' });
    }
};


// @desc    Verify OTP and register user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp, password } = req.body; // Need password here too, as user is created now

    console.log('--- verifyOtp function started ---'); // ADDED FOR DEBUGGING
    console.log('Received for verification:', { email, otp }); // ADDED FOR DEBUGGING

    try {
        // 1. Find the OTP record
        const otpRecord = await OTP.findOne({ email, otp });
        console.log('OTP Record found:', otpRecord); // ADDED FOR DEBUGGING

        // 2. Check if OTP is valid and not expired (TTL handles expiry in DB)
        if (!otpRecord) {
            console.log('Invalid or expired OTP for email:', email); // ADDED FOR DEBUGGING
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // --- IMPORTANT: Check if user already exists before trying to save again ---
        // This prevents duplicate key errors if user refreshes or tries to verify multiple times
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists after OTP verification for email:', email); // ADDED FOR DEBUGGING
            // Delete the used OTP record
            await OTP.deleteOne({ email, otp });
            // Log them in if they already exist from a previous attempt
            const token = generateToken(existingUser._id, existingUser.role);
            return res.status(200).json({
                message: 'User already registered and verified. Logged in.',
                token,
                user: {
                    id: existingUser._id,
                    email: existingUser.email,
                    role: existingUser.role
                }
            });
        }


        // 3. OTP is valid, now create the user
        console.log('Attempting to create new user for email:', email); // ADDED FOR DEBUGGING
        const user = new User({ email, password }); // Password will be hashed by pre-save hook
        await user.save(); // THIS IS WHERE THE USER IS ACTUALLY SAVED
        console.log('User saved successfully:', user); // ADDED FOR DEBUGGING

        // 4. Delete the used OTP record
        await OTP.deleteOne({ email, otp });
        console.log('OTP record deleted.'); // ADDED FOR DEBUGGING

        // 5. Generate JWT token for immediate login
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('--- Error in verifyOtp catch block ---', error); // ADDED FOR DEBUGGING
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'User with this email already exists (duplicate key error).' });
        }
        res.status(500).json({ message: 'Server error during OTP verification: ' + error.message }); // Make error message more descriptive
    } finally {
        console.log('--- verifyOtp function finished ---'); // ADDED FOR DEBUGGING
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (user not found).' });
        }

        // 2. Check password
        const isMatch = await user.matchPassword(password); // Use the method from User model
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (password incorrect).' });
        }

        // 3. Generate JWT token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = {
    registerOtpRequest,
    verifyOtp,
    loginUser
};