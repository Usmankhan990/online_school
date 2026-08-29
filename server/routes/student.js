const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate, requireRole('student'));

// Dashboard
router.get('/dashboard', studentController.getStudentDashboard);

// Courses
router.get('/courses', studentController.getMyCourses);
router.get('/courses-detail', studentController.getMyCoursesDetailed);

// Books
router.get('/books', studentController.getMyBooks);

// Homework
router.get('/homework', studentController.getMyHomework);
router.post('/homework/submit', upload.single('file'), studentController.submitHomework);

// Exams
router.get('/exams-list', studentController.getMyExamsList);
router.post('/exams/:exam_id/start', studentController.startExam);
router.post('/exams/save-answer', upload.single('file'), studentController.saveAnswer);
router.post('/exams/:attempt_id/submit', studentController.submitExam);

// Results & Report Card
router.get('/results', studentController.getMyResults);
router.get('/report-card', studentController.getReportCard);

// Attendance
router.get('/attendance', studentController.getMyAttendance);
router.post('/attendance/selfie', studentController.markSelfieAttendance);

// Fees
router.get('/fees', studentController.getMyFees);
router.post('/fees/pay', upload.single('payment_proof'), studentController.payFee);

// Live Classes
router.get('/live-classes', studentController.getMyLiveClasses);

// Timetable
router.get('/timetable', studentController.getMyTimetable);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);
router.put('/notifications/read-all', studentController.markAllNotificationsRead);

module.exports = router;
