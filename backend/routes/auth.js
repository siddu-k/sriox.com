const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Email verification
router.get('/verify/:token', verifyEmail);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

module.exports = router;