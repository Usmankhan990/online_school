const { User, StudentProfile, Course, CourseMaterial, Enrollment, Exam, ExamQuestion, ExamAttempt, ExamAnswer, ClassworkHomework, Submission, Attendance, Fee, Book, LiveClass, Timetable, Class, Subject, Notification } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Student Dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'class' }],
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['full_name'] },
        ],
      }],
    });

    const pendingHomework = await ClassworkHomework.findAll({
      where: {
        course_id: { [Op.in]: enrollments.map(e => e.course_id) },
        is_published: true,
      },
      include: [
        { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] },
        { model: Submission, as: 'submissions', where: { student_id: req.user.id }, required: false },
      ],
      order: [['due_date', 'ASC']],
      limit: 10,
    });

    const upcomingExams = await Exam.findAll({
      where: {
        course_id: { [Op.in]: enrollments.map(e => e.course_id) },
        is_published: true,
      },
      include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      order: [['start_time', 'ASC']],
      limit: 5,
    });

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({
      where: { student_id: req.user.id, date: today },
    });

    const attendanceStats = await Attendance.findAll({
      where: { student_id: req.user.id },
      attributes: ['status'],
    });
    const totalDays = attendanceStats.length;
    const presentDays = attendanceStats.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100;

    // Fees summary
    const pendingFees = await Fee.findAll({
      where: { student_id: req.user.id, status: { [Op.in]: ['pending', 'overdue'] } },
    });
    const feesDue = pendingFees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

    // Unread notifications count
    const unreadNotifications = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    // Recent notifications
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    // Upcoming live classes
    const upcomingLiveClasses = await LiveClass.count({
      where: {
        course_id: { [Op.in]: enrollments.map(e => e.course_id) },
        status: 'scheduled',
        scheduled_at: { [Op.gte]: new Date() },
      },
    });

    // Today's timetable
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = dayNames[new Date().getDay()];
    const todaySchedule = await Timetable.findAll({
      where: { class_id: profile.class_id, day_of_week: todayDay },
      include: [{ model: Subject, as: 'subject' }],
      order: [['start_time', 'ASC']],
    });

    res.json({
      profile,
      enrollments,
      enrolledCourses: enrollments.length,
      pendingHomework: pendingHomework.filter(h => !h.submissions || h.submissions.length === 0).length,
      upcomingExams: upcomingExams.length,
      attendancePercent: parseFloat(attendancePercent),
      todayAttendance: todayAttendance?.status || 'not_marked',
      feesDue,
      unreadNotifications,
      notifications,
      upcomingLiveClasses,
      todaySchedule,
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

// Get my courses
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['full_name'] },
          { model: CourseMaterial, as: 'materials' },
        ],
      }],
    });
    res.json({ courses: enrollments.map(e => e.course) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// Get books for my class
exports.getMyBooks = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const books = await Book.findAll({
      where: { class_id: profile.class_id, is_active: true },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
      ],
      order: [['subject_id', 'ASC']],
    });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

// ============= SELFIE ATTENDANCE =============
exports.markSelfieAttendance = async (req, res) => {
  try {
    const { selfie_data } = req.body; // base64 image
    const today = new Date().toISOString().split('T')[0];

    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Check if already marked today
    const existing = await Attendance.findOne({
      where: { student_id: req.user.id, class_id: profile.class_id, date: today },
    });
    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for today.', attendance: existing });
    }

    // Save selfie
    let selfiePath = null;
    if (selfie_data) {
      const dir = path.join(__dirname, '..', 'uploads', 'attendance');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const base64Data = selfie_data.replace(/^data:image\/\w+;base64,/, '');
      const filename = `selfie-${req.user.id}-${Date.now()}.jpg`;
      fs.writeFileSync(path.join(dir, filename), base64Data, 'base64');
      selfiePath = `/uploads/attendance/${filename}`;
    }

    const attendance = await Attendance.create({
      student_id: req.user.id,
      class_id: profile.class_id,
      date: today,
      status: 'present',
      verification_method: 'selfie',
      selfie_path: selfiePath,
      remarks: 'Auto-marked via selfie verification',
    });

    res.status(201).json({ message: 'Attendance marked successfully!', attendance });
  } catch (err) {
    console.error('Selfie attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance.' });
  }
};

// ============= LIVE CLASSES =============
exports.getMyLiveClasses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });

    const liveClasses = await LiveClass.findAll({
      where: { course_id: { [Op.in]: enrollments.map(e => e.course_id) } },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['id', 'full_name'] },
        ],
      }],
      order: [['scheduled_at', 'DESC']],
    });

    res.json({ liveClasses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live classes.' });
  }
};

// ============= FEE PAYMENT =============
exports.payFee = async (req, res) => {
  try {
    const { fee_id, payment_method, transaction_id } = req.body;

    const fee = await Fee.findOne({ where: { id: fee_id, student_id: req.user.id } });
    if (!fee) return res.status(404).json({ error: 'Fee record not found.' });
    if (fee.status === 'paid') return res.status(400).json({ error: 'Fee already paid.' });

    // Save payment proof if uploaded
    let proofPath = null;
    if (req.file) {
      proofPath = `/uploads/${req.file.filename}`;
    }

    await fee.update({
      payment_method,
      transaction_id,
      payment_proof: proofPath,
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    });

    // Notify admin about payment
    const admins = await User.findAll({ where: { role: 'super_admin' } });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin.id,
        title: 'ðŸ’° Fee Payment Submitted',
        message: `${req.user.full_name} has submitted payment for ${fee.month}. Method: ${payment_method}. Transaction ID: ${transaction_id || 'N/A'}. Please verify.`,
        type: 'fee',
        link: '/admin/fees',
      });
    }

    // Reactivate student if suspended due to non-payment
    if (req.user.status === 'suspended') {
      await req.user.update({ status: 'active' });
    }

    res.json({ message: 'Payment submitted! Awaiting admin verification.', fee });
  } catch (err) {
    console.error('Pay fee error:', err);
    res.status(500).json({ error: 'Failed to submit payment.' });
  }
};

// Attempt Exam
exports.startExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findByPk(exam_id, {
      include: [{ model: ExamQuestion, as: 'questions', attributes: { exclude: ['correct_answer'] } }],
    });
    if (!exam || !exam.is_published) {
      return res.status(404).json({ error: 'Exam not found or not published.' });
    }

    // Check existing attempt
    let attempt = await ExamAttempt.findOne({
      where: { exam_id, student_id: req.user.id, status: 'in_progress' },
    });

    if (!attempt) {
      attempt = await ExamAttempt.create({
        exam_id, student_id: req.user.id, started_at: new Date(),
      });
    }

    res.json({ exam, attempt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start exam.' });
  }
};

// Save answer (auto-save)
exports.saveAnswer = async (req, res) => {
  try {
    const { attempt_id, question_id, answer_text } = req.body;

    const [answer] = await ExamAnswer.findOrCreate({
      where: { attempt_id, question_id },
      defaults: { answer_text, file_path: req.file ? req.file.filename : null },
    });

    if (answer) {
      await answer.update({
        answer_text,
        file_path: req.file ? req.file.filename : answer.file_path,
      });
    }

    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save answer.' });
  }
};

// Submit exam
exports.submitExam = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    const attempt = await ExamAttempt.findByPk(attempt_id, {
      include: [
        { model: ExamAnswer, as: 'answers' },
        { model: Exam, as: 'exam', include: [{ model: ExamQuestion, as: 'questions' }] },
      ],
    });

    if (!attempt || attempt.student_id !== req.user.id) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    // Auto-grade MCQ and True/False
    let totalObtained = 0;
    let hasSubjective = false;

    for (const question of attempt.exam.questions) {
      const answer = attempt.answers.find(a => a.question_id === question.id);
      if (!answer) continue;

      if (question.question_type === 'mcq' || question.question_type === 'true_false') {
        const isCorrect = answer.answer_text?.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase();
        const marks = isCorrect ? question.marks : 0;
        await answer.update({ is_correct: isCorrect, marks_obtained: marks });
        totalObtained += marks;
      } else {
        hasSubjective = true;
      }
    }

    const percentage = (totalObtained / attempt.exam.total_marks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    await attempt.update({
      submitted_at: new Date(),
      total_obtained: totalObtained,
      percentage,
      grade,
      status: hasSubjective ? 'submitted' : 'graded',
    });

    res.json({ message: 'Exam submitted!', result: { totalObtained, percentage, grade } });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ error: 'Failed to submit exam.' });
  }
};

// submitHomework is defined further below in the HOMEWORK section

// Get my results
exports.getMyResults = async (req, res) => {
  try {
    const attempts = await ExamAttempt.findAll({
      where: { student_id: req.user.id, status: { [Op.in]: ['submitted', 'graded'] } },
      include: [{
        model: Exam, as: 'exam',
        include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      }],
      order: [['submitted_at', 'DESC']],
    });
    res.json({ results: attempts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};

// Get my attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const where = { student_id: req.user.id };
    if (month) {
      where.date = { [Op.like]: `${month}%` };
    }
    const attendance = await Attendance.findAll({
      where,
      order: [['date', 'DESC']],
    });

    // Attendance stats
    const all = await Attendance.findAll({ where: { student_id: req.user.id } });
    const totalDays = all.length;
    const presentDays = all.filter(a => a.status === 'present' || a.status === 'late').length;

    res.json({
      attendance,
      stats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
};

// Get my fees
exports.getMyFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      where: { student_id: req.user.id },
      include: [{ model: Class, as: 'class' }],
      order: [['created_at', 'DESC']],
    });

    const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0);
    const totalDue = fees.filter(f => f.status !== 'paid' && f.status !== 'waived').reduce((s, f) => s + parseFloat(f.amount || 0), 0);

    res.json({ fees, totalPaid, totalDue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fees.' });
  }
};

// Get timetable
exports.getMyTimetable = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const timetable = await Timetable.findAll({
      where: { class_id: profile.class_id },
      include: [{ model: Subject, as: 'subject' }],
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
    });
    res.json({ timetable });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetable.' });
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
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
};

// ============= MY HOMEWORK =============
exports.getMyHomework = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });
    const courseIds = enrollments.map(e => e.course_id);

    const homework = await ClassworkHomework.findAll({
      where: { course_id: { [Op.in]: courseIds }, is_published: true },
      include: [
        { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }, { model: Class, as: 'class' }] },
        { model: Submission, as: 'submissions', where: { student_id: req.user.id }, required: false },
      ],
      order: [['due_date', 'DESC']],
    });

    res.json({ homework });
  } catch (err) {
    console.error('Get homework error:', err);
    res.status(500).json({ error: 'Failed to fetch homework.' });
  }
};

// Submit homework
exports.submitHomework = async (req, res) => {
  try {
    const { homework_id, content } = req.body;
    const hw = await ClassworkHomework.findByPk(homework_id);
    if (!hw) return res.status(404).json({ error: 'Homework not found.' });

    // Check if already submitted
    const existing = await Submission.findOne({ where: { homework_id, student_id: req.user.id } });
    if (existing) return res.status(400).json({ error: 'Already submitted.' });

    const submission = await Submission.create({
      homework_id,
      student_id: req.user.id,
      content,
      file_path: req.file ? req.file.filename : null,
      submitted_at: new Date(),
      status: 'submitted',
    });
    res.status(201).json({ submission });
  } catch (err) {
    console.error('Submit homework error:', err);
    res.status(500).json({ error: 'Failed to submit homework.' });
  }
};

// ============= MY EXAMS LIST =============
exports.getMyExamsList = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });
    const courseIds = enrollments.map(e => e.course_id);

    const exams = await Exam.findAll({
      where: { course_id: { [Op.in]: courseIds }, is_published: true },
      include: [
        { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }, { model: Class, as: 'class' }] },
        { model: ExamAttempt, as: 'attempts', where: { student_id: req.user.id }, required: false },
      ],
      order: [['start_time', 'DESC']],
    });

    res.json({ exams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams.' });
  }
};

// ============= REPORT CARD =============
exports.getReportCard = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'class' }, { model: User, as: 'user', attributes: ['full_name', 'email'] }],
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const attempts = await ExamAttempt.findAll({
      where: { student_id: req.user.id, status: 'graded' },
      include: [{
        model: Exam, as: 'exam',
        include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      }],
    });

    // Group by subject
    const subjectMap = {};
    for (const attempt of attempts) {
      const subjectName = attempt.exam?.course?.subject?.name || 'Unknown';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { subject: subjectName, exams: [], totalObtained: 0, totalMarks: 0 };
      }
      subjectMap[subjectName].exams.push({
        title: attempt.exam.title,
        obtained: attempt.total_obtained || 0,
        total: attempt.exam.total_marks || 0,
        percentage: attempt.percentage || 0,
        grade: attempt.grade || '-',
      });
      subjectMap[subjectName].totalObtained += (attempt.total_obtained || 0);
      subjectMap[subjectName].totalMarks += (attempt.exam.total_marks || 0);
    }

    const subjects = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.totalMarks > 0 ? ((s.totalObtained / s.totalMarks) * 100).toFixed(1) : 0,
      grade: getGrade(s.totalMarks > 0 ? (s.totalObtained / s.totalMarks) * 100 : 0),
    }));

    const grandTotal = subjects.reduce((s, sub) => s + sub.totalObtained, 0);
    const grandMax = subjects.reduce((s, sub) => s + sub.totalMarks, 0);
    const overallPercentage = grandMax > 0 ? ((grandTotal / grandMax) * 100).toFixed(1) : 0;

    res.json({
      student: { name: profile.user?.full_name, class: profile.class?.display_name, rollNo: profile.roll_number },
      subjects,
      summary: { totalObtained: grandTotal, totalMarks: grandMax, percentage: overallPercentage, grade: getGrade(overallPercentage) },
    });
  } catch (err) {
    console.error('Report card error:', err);
    res.status(500).json({ error: 'Failed to generate report card.' });
  }
};

function getGrade(p) {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
}

// ============= MY COURSES DETAILED =============
exports.getMyCoursesDetailed = async (req, res) => {
  try {
    const { Module, Lesson } = require('../models');
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['full_name'] },
          { model: CourseMaterial, as: 'materials', required: false, order: [['order_index', 'ASC']] },
          { 
            model: Module, as: 'modules', 
            include: [{ model: Lesson, as: 'lessons', order: [['order_index', 'ASC']] }],
            order: [['order_index', 'ASC']]
          }
        ],
      }],
    });
    res.json({ courses: enrollments.map(e => e.course) });
  } catch (err) {
    console.error('Fetch detailed courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

