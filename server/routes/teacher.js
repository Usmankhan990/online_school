const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate, requireRole('teacher'));

// Dashboard
router.get('/dashboard', teacherController.getTeacherDashboard);

// Courses
router.get('/courses', teacherController.getMyCourses);
router.post('/courses', teacherController.createCourse);
router.put('/courses/:id', teacherController.updateCourse);

// Course Materials
router.get('/materials', teacherController.getMyMaterials);
router.get('/courses/:courseId/materials', teacherController.getCourseMaterials);
router.post('/materials', upload.single('file'), teacherController.addMaterial);
router.delete('/materials/:id', teacherController.deleteMaterial);

// Exams
router.get('/exams', teacherController.getMyExams);
router.post('/exams', teacherController.createExam);
router.put('/exams/:id/publish', teacherController.publishExam);
router.post('/exams/grade-answer', teacherController.gradeAnswer);

// Homework
router.get('/homework', teacherController.getMyHomework);
router.post('/homework', upload.single('file'), teacherController.createHomework);

// Submissions
router.get('/submissions', teacherController.getSubmissions);
router.put('/submissions/:id/grade', teacherController.gradeSubmission);

// Results
router.get('/results', teacherController.getMyResults);

// Attendance
router.post('/attendance', teacherController.markAttendance);
router.get('/attendance', teacherController.getAttendance);
router.get('/class-students', teacherController.getClassStudents);

// Live Classes
router.get('/live-classes', teacherController.getMyLiveClasses);
router.post('/live-classes', teacherController.createLiveClass);
router.put('/live-classes/:id', teacherController.updateLiveClass);

// Notifications
router.get('/notifications', teacherController.getNotifications);
router.put('/notifications/:id/read', teacherController.markNotificationRead);
router.put('/notifications/read-all', teacherController.markAllNotificationsRead);

module.exports = router;
