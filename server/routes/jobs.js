const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Public route to get active job posts
router.get('/', jobController.getPublicJobs);

module.exports = router;
