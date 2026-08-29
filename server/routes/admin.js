const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require authentication + super_admin role
router.use(authenticate, requireRole('super_admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Student Management
router.get('/students', adminController.getAllStudents);
router.get('/pending-students', adminController.getPendingStudents);
router.put('/approve-student/:id', adminController.approveStudent);
router.put('/reject-student/:id', adminController.rejectStudent);

// Teacher Management
router.get('/teachers', adminController.getAllTeachers);
router.post('/teachers', adminController.createTeacher);

// Parents Management
router.get('/parents', adminController.getParents);

// Delete any user
router.delete('/users/:id', adminController.deleteUser);

// Class & Subject management
router.get('/classes', adminController.getClasses);

router.get('/subjects', adminController.getSubjects);

// Fees Management
router.get('/fees', adminController.getAllFees);
router.post('/fees', adminController.createFee);
router.post('/fees/generate-monthly', adminController.generateMonthlyFees);
router.put('/fees/:id', adminController.updateFeeStatus);
router.put('/fees/:id/verify', adminController.verifyPayment);

// Courses & Exams Management
router.get('/courses', adminController.getCourses);
router.get('/exams', adminController.getExams);

// Books Management
router.get('/books', adminController.getAllBooks);
router.post('/books', adminController.addBook);
router.post('/books/bulk', adminController.bulkAddBooks);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

// Reports & Analytics
router.get('/reports', adminController.getReportsData);

// Results Overview
router.get('/results', adminController.getResultsStats);

// Attendance Overview
router.get('/attendance', adminController.getAttendanceStats);

// Notifications Management
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.sendNotification);

// System Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

module.exports = router;
