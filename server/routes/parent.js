const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('parent'));

router.get('/dashboard', parentController.getParentDashboard);
router.get('/child-attendance', parentController.getChildAttendance);
router.get('/child-fees', parentController.getChildFees);
router.get('/child-results', parentController.getChildResults);
router.get('/child-homework', parentController.getChildHomework);
router.get('/notifications', parentController.getNotifications);
router.put('/notifications/:id/read', parentController.markNotificationRead);
router.put('/notifications/read-all', parentController.markAllNotificationsRead);

module.exports = router;
