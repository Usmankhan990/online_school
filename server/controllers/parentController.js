const { User, StudentProfile, Class, Attendance, Fee, ExamAttempt, Exam, Course, Subject, ClassworkHomework, Submission, Notification } = require('../models');
const { Op } = require('sequelize');

// Parent Dashboard
exports.getParentDashboard = async (req, res) => {
  try {
    // Find linked children
    const children = await StudentProfile.findAll({
      where: { parent_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'status'] },
        { model: Class, as: 'class' },
      ],
    });

    if (children.length === 0) {
      return res.json({ children: [], message: 'No children linked to your account.' });
    }

    const childrenData = [];

    for (const child of children) {
      // Attendance
      const attendanceRecords = await Attendance.findAll({
        where: { student_id: child.user_id },
      });
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;

      // Fees
      const fees = await Fee.findAll({
        where: { student_id: child.user_id },
        order: [['created_at', 'DESC']],
        limit: 6,
      });

      // Recent Results
      const results = await ExamAttempt.findAll({
        where: { student_id: child.user_id, status: 'graded' },
        include: [{
          model: Exam, as: 'exam',
          include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
        }],
        order: [['submitted_at', 'DESC']],
        limit: 5,
      });

      // Homework status
      const submissions = await Submission.findAll({
        where: { student_id: child.user_id },
        include: [{
          model: ClassworkHomework, as: 'homework',
          include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
        }],
        order: [['submitted_at', 'DESC']],
        limit: 10,
      });

      childrenData.push({
        profile: child,
        attendance: {
          totalDays,
          presentDays,
          percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100,
        },
        fees,
        results,
        recentSubmissions: submissions,
      });
    }

    res.json({ children: childrenData });
  } catch (err) {
    console.error('Parent dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

// Child Attendance
exports.getChildAttendance = async (req, res) => {
  try {
    const { student_id, month } = req.query;

    // Verify parent-child link
    const child = await StudentProfile.findOne({
      where: { user_id: student_id, parent_id: req.user.id },
    });
    if (!child) return res.status(403).json({ error: 'Access denied.' });

    const where = { student_id };
    if (month) where.date = { [Op.like]: `${month}%` };

    const attendance = await Attendance.findAll({ where, order: [['date', 'DESC']] });
    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
};

// Child Fees
exports.getChildFees = async (req, res) => {
  try {
    const { student_id } = req.query;
    const child = await StudentProfile.findOne({
      where: { user_id: student_id, parent_id: req.user.id },
    });
    if (!child) return res.status(403).json({ error: 'Access denied.' });

    const fees = await Fee.findAll({
      where: { student_id },
      include: [{ model: Class, as: 'class' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ fees });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fees.' });
  }
};

// Child Results
exports.getChildResults = async (req, res) => {
  try {
    const { student_id } = req.query;
    const child = await StudentProfile.findOne({
      where: { user_id: student_id, parent_id: req.user.id },
    });
    if (!child) return res.status(403).json({ error: 'Access denied.' });

    const results = await ExamAttempt.findAll({
      where: { student_id, status: { [Op.in]: ['submitted', 'graded'] } },
      include: [{
        model: Exam, as: 'exam',
        include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      }],
      order: [['submitted_at', 'DESC']],
    });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};

// Child Homework
exports.getChildHomework = async (req, res) => {
  try {
    const { student_id } = req.query;
    const child = await StudentProfile.findOne({
      where: { user_id: student_id, parent_id: req.user.id },
    });
    if (!child) return res.status(403).json({ error: 'Access denied.' });

    const submissions = await Submission.findAll({
      where: { student_id },
      include: [{
        model: ClassworkHomework, as: 'homework',
        include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      }],
      order: [['submitted_at', 'DESC']],
    });

    // Also get unsubmitted homework
    const { Enrollment } = require('../models');
    const enrollments = await Enrollment.findAll({ where: { student_id, status: 'active' } });
    const courseIds = enrollments.map(e => e.course_id);
    const allHomework = await ClassworkHomework.findAll({
      where: { course_id: { [Op.in]: courseIds }, is_published: true },
      include: [
        { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] },
        { model: Submission, as: 'submissions', where: { student_id }, required: false },
      ],
      order: [['due_date', 'DESC']],
    });

    res.json({ homework: allHomework, submissions });
  } catch (err) {
    console.error('Parent homework err:', err);
    res.status(500).json({ error: 'Failed to fetch homework.' });
  }
};

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update.' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update.' });
  }
};

