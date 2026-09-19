const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student Registration (with document upload)
router.post('/register/student', upload.array('documents', 5), authController.registerStudent);

// Student Trial Registration
router.post('/register/trial', authController.registerTrialStudent);

// Parent Registration
router.post('/register/parent', authController.registerParent);

// Login
router.post('/login', authController.login);

// Profile (authenticated)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }
    next();
  });
}, authController.updateProfile);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Get unread notifications count
router.get('/notifications/unread-count', authenticate, authController.getUnreadNotificationsCount);

// Verify current password live
router.post('/verify-password', authenticate, authController.verifyCurrentPassword);

module.exports = router;
