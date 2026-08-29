const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student Registration (with document upload)
router.post('/register/student', upload.array('documents', 5), authController.registerStudent);

// Parent Registration
router.post('/register/parent', authController.registerParent);

// Login
router.post('/login', authController.login);

// Get profile (authenticated)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
