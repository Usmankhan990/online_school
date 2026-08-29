const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public: list classes (for dropdowns, student registration)
router.get('/', authenticate, classController.getAll);
router.get('/:id', authenticate, classController.getById);
router.get('/:id/subjects', authenticate, classController.getSubjects);

// Admin-only operations
router.post('/', authenticate, requireRole('super_admin'), classController.create);
router.put('/:id', authenticate, requireRole('super_admin'), classController.update);
router.delete('/:id', authenticate, requireRole('super_admin'), classController.remove);
router.put('/:id/toggle', authenticate, requireRole('super_admin'), classController.toggleActive);
router.post('/:id/subjects', authenticate, requireRole('super_admin'), classController.assignSubjects);

module.exports = router;
