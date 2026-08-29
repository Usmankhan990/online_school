const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public: list subjects
router.get('/', authenticate, subjectController.getAll);
router.get('/:id', authenticate, subjectController.getById);

// Admin-only operations
router.post('/', authenticate, requireRole('super_admin'), subjectController.create);
router.put('/:id', authenticate, requireRole('super_admin'), subjectController.update);
router.delete('/:id', authenticate, requireRole('super_admin'), subjectController.remove);
router.put('/:id/toggle', authenticate, requireRole('super_admin'), subjectController.toggleActive);

module.exports = router;
