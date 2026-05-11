const express = require('express');
const router = express.Router();
const { register, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
