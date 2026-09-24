const { User, StudentProfile, Course, CourseMaterial, Enrollment, Exam, ExamQuestion, ExamAttempt, ExamAnswer, ClassworkHomework, Submission, Attendance, Fee, Book, LiveClass, Timetable, Class, Subject, ClassSubject, Notification } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Helper to auto-enroll student in all active courses of their class (assigned subjects only)
const ensureStudentEnrollments = async (userId) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: userId },
      include: [{ model: Class, as: 'class' }],
    });
    if (!profile || !profile.class_id) return { profile, courseIds: [] };

    const classSubjects = await ClassSubject.findAll({
      where: { class_id: profile.class_id },
      attributes: ['subject_id'],
    });
    const allowedSubjectIds = classSubjects.map(cs => cs.subject_id);

    const courseWhere = { class_id: profile.class_id };
    if (allowedSubjectIds.length > 0) {
      courseWhere.subject_id = { [Op.in]: allowedSubjectIds };
    }

    const classCourses = await Course.findAll({ where: courseWhere });
    if (!classCourses || classCourses.length === 0) return { profile, courseIds: [] };

    for (const course of classCourses) {
      await Enrollment.findOrCreate({
        where: { student_id: userId, course_id: course.id },
        defaults: { status: 'active' },
      });
    }
    return { profile, courseIds: classCourses.map(c => c.id) };
  } catch (err) {
    console.error('Error ensuring student enrollments:', err);
    return { profile: null, courseIds: [] };
  }
};

// Student Dashboard
exports.getStudentDashboard = async (req, res) => {
  try {
    const { profile, courseIds } = await ensureStudentEnrollments(req.user.id);
    const resolvedProfile = profile || await StudentProfile.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'class' }],
    });
    if (!resolvedProfile) return res.status(404).json({ error: 'Profile not found.' });

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

    const activeCourseIds = Array.from(new Set([
      ...enrollments.map(e => e.course_id),
      ...(courseIds || [])
    ]));

    const pendingHomework = await ClassworkHomework.findAll({
      where: {
        course_id: { [Op.in]: activeCourseIds },
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
        course_id: { [Op.in]: activeCourseIds },
        is_published: true,
      },
      include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }] }],
      order: [['start_time', 'ASC']],
      limit: 5,
    });

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({
      where: { user_id: req.user.id, user_role: 'student', date: today },
    });

    const attendanceStats = await Attendance.findAll({
      where: { user_id: req.user.id, user_role: 'student' },
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
        course_id: { [Op.in]: activeCourseIds },
        status: 'scheduled',
        scheduled_at: { [Op.gte]: new Date() },
      },
    });

    // Build Subject -> Teacher Name map for student's class
    const subjectTeacherMap = {};
    const classCourses = await Course.findAll({
      where: { class_id: resolvedProfile.class_id },
      include: [
        { model: Subject, as: 'subject' },
        { model: User, as: 'teacher', attributes: ['id', 'full_name', 'email'] },
      ],
    });
    for (const c of classCourses) {
      if (c.subject?.name && c.teacher?.full_name) {
        subjectTeacherMap[c.subject.name.toLowerCase().trim()] = c.teacher.full_name;
      }
    }
    for (const e of enrollments) {
      if (e.course?.subject?.name && e.course?.teacher?.full_name) {
        subjectTeacherMap[e.course.subject.name.toLowerCase().trim()] = e.course.teacher.full_name;
      }
    }

    // Today's timetable
    let todaySchedule = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = dayNames[new Date().getDay()];
    const dbSchedule = await Timetable.findAll({
      where: { class_id: resolvedProfile.class_id, day_of_week: todayDay },
      include: [
        { model: Subject, as: 'subject' },
      ],
      order: [['start_time', 'ASC']],
    });

    if (dbSchedule && dbSchedule.length > 0) {
      todaySchedule = dbSchedule.map(s => {
        const subName = s.subject?.name || 'Subject';
        let teacherName = subjectTeacherMap[subName.toLowerCase().trim()];
        if (!teacherName) {
          const cleanSub = subName.toLowerCase().trim();
          for (const [k, v] of Object.entries(subjectTeacherMap)) {
            if (cleanSub.includes(k) || k.includes(cleanSub)) {
              teacherName = v;
              break;
            }
          }
        }
        return {
          start_time: s.start_time,
          end_time: s.end_time,
          subject_name: subName,
          teacher_name: teacherName || 'Assigned Faculty',
        };
      });
    } else {
      // Fallback to master school timetable
      const { Settings } = require('../models');
      const timetableRoute = require('../routes/timetable');
      let masterTt = timetableRoute.DEFAULT_TIMETABLE;
      const ttRow = await Settings.findOne({ where: { key: 'master_school_timetable' } });
      if (ttRow && ttRow.value) {
        try { masterTt = JSON.parse(ttRow.value); } catch (e) {}
      }

      const classDisplayName = resolvedProfile.class?.display_name || '';
      const className = resolvedProfile.class?.name || '';
      const gradeLevel = resolvedProfile.class?.grade_level;

      const classRow = (masterTt?.scheduleData || []).find(r => {
        const rClass = (r.class || '').toLowerCase().trim();
        const cDisplay = classDisplayName.toLowerCase().trim();
        const cName = className.toLowerCase().trim();
        const cGrade = gradeLevel !== undefined ? `class ${gradeLevel}` : '';
        
        return rClass === cDisplay ||
               rClass === cName ||
               (cGrade && rClass === cGrade) ||
               rClass.replace(/\s+/g, '') === cDisplay.replace(/\s+/g, '') ||
               rClass.replace(/\s+/g, '') === cName.replace(/\s+/g, '') ||
               (cDisplay && (rClass.includes(cDisplay) || cDisplay.includes(rClass)));
      });

      if (classRow && Array.isArray(masterTt?.columns)) {
        for (const col of masterTt.columns) {
          if (col.key === 'class' || col.key === 'break') continue;
          const rawSubName = classRow[col.key];
          if (!rawSubName || rawSubName.toUpperCase() === 'RECESS' || rawSubName.toUpperCase() === 'BREAK') continue;

          const timeParts = (col.time || '').split('-').map(t => t.trim());
          const startTime = timeParts[0] || '';
          const endTime = timeParts[1] || '';

          let teacherName = null;
          const cleanSub = rawSubName.toLowerCase().trim();
          for (const [subjKey, tName] of Object.entries(subjectTeacherMap)) {
            if (cleanSub.includes(subjKey) || subjKey.includes(cleanSub)) {
              teacherName = tName;
              break;
            }
          }

          todaySchedule.push({
            start_time: startTime,
            end_time: endTime,
            subject_name: rawSubName,
            teacher_name: teacherName || 'Assigned Faculty',
            period: col.label || col.key,
          });
        }
      }
    }

    res.json({
      profile: resolvedProfile,
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
    await ensureStudentEnrollments(req.user.id);
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['id', 'full_name', 'email'] },
          { model: CourseMaterial, as: 'materials' },
        ],
      }],
    });
    res.json({ courses: enrollments.map(e => e.course).filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// Get books for my class (strictly assigned subjects only)
exports.getMyBooks = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'class' }],
    });
    if (!profile || !profile.class_id) {
      return res.json({ books: [], studentClass: null });
    }

    // Find assigned subjects for this class
    const classSubjects = await ClassSubject.findAll({
      where: { class_id: profile.class_id },
      attributes: ['subject_id'],
    });
    const allowedSubjectIds = classSubjects.map(cs => cs.subject_id);

    // If no subjects assigned to class, student sees no books
    if (!allowedSubjectIds || allowedSubjectIds.length === 0) {
      return res.json({ books: [], studentClass: profile.class });
    }

    const books = await Book.findAll({
      where: {
        class_id: profile.class_id,
        subject_id: { [Op.in]: allowedSubjectIds },
        is_active: true,
      },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
      ],
      order: [['sort_order', 'ASC'], ['subject_id', 'ASC'], ['title', 'ASC']],
    });
    res.json({ books, studentClass: profile.class });
  } catch (err) {
    console.error('Get my books error:', err);
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

// ============= SELFIE ATTENDANCE =============
exports.markSelfieAttendance = async (req, res) => {
  try {
    const { selfie_data } = req.body; // base64 image
    const today = new Date().toISOString().split('T')[0];

    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Student profile not found.' });

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

    // Check if already marked today
    const existing = await Attendance.findOne({
      where: { user_id: req.user.id, user_role: 'student', date: today },
    });

    let attendance;
    if (existing) {
      await existing.update({
        status: 'present',
        verification_method: 'selfie',
        selfie_path: selfiePath || existing.selfie_path,
        remarks: 'Selfie verified attendance',
      });
      attendance = existing;
    } else {
      attendance = await Attendance.create({
        user_id: req.user.id,
        user_role: 'student',
        class_id: profile.class_id,
        date: today,
        status: 'present',
        verification_method: 'selfie',
        selfie_path: selfiePath,
        remarks: 'Auto-marked via selfie verification',
      });
    }

    res.status(200).json({ message: 'Selfie attendance verified and marked successfully!', attendance });
  } catch (err) {
    console.error('Selfie attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance.' });
  }
};

// ============= LIVE CLASSES =============
exports.getMyLiveClasses = async (req, res) => {
  try {
    const { courseIds } = await ensureStudentEnrollments(req.user.id);
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });
    const activeCourseIds = Array.from(new Set([
      ...enrollments.map(e => e.course_id),
      ...(courseIds || [])
    ]));

    const liveClasses = await LiveClass.findAll({
      where: { course_id: { [Op.in]: activeCourseIds } },
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

    if (!transaction_id || transaction_id.trim().length < 6) {
      return res.status(400).json({ error: 'Transaction ID must be at least 6 characters.' });
    }

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

// Get Exam Review with student answers and correct answers for preview
exports.getExamReview = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const attempt = await ExamAttempt.findOne({
      where: { exam_id, student_id: req.user.id },
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }, { model: Class, as: 'class' }] },
            { model: ExamQuestion, as: 'questions' },
          ],
        },
        {
          model: ExamAnswer,
          as: 'answers',
        },
      ],
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Exam attempt not found.' });
    }

    if (attempt.exam && attempt.exam.questions) {
      attempt.exam.questions.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    }

    res.json({ attempt });
  } catch (err) {
    console.error('Get exam review error:', err);
    res.status(500).json({ error: 'Failed to fetch exam review.' });
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
    const where = { user_id: req.user.id, user_role: 'student' };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      if (year && m) {
        const lastDay = new Date(year, m, 0).getDate();
        const startDate = `${month}-01`;
        const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
        where.date = { [Op.between]: [startDate, endDate] };
      }
    }
    const attendance = await Attendance.findAll({
      where,
      order: [['date', 'DESC']],
    });

    // Attendance stats
    const all = await Attendance.findAll({ where: { user_id: req.user.id, user_role: 'student' } });
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
    console.error('Get my attendance error:', err);
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

    // Fetch Payment Settings
    const { Settings } = require('../models');
    const settingsRows = await Settings.findAll();
    const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

    res.json({ fees, totalPaid, totalDue, settings });
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
    const { courseIds } = await ensureStudentEnrollments(req.user.id);
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });
    const activeCourseIds = Array.from(new Set([
      ...enrollments.map(e => e.course_id),
      ...(courseIds || [])
    ]));

    const homework = await ClassworkHomework.findAll({
      where: { course_id: { [Op.in]: activeCourseIds }, is_published: true },
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

// Submit or edit/resubmit homework
exports.submitHomework = async (req, res) => {
  try {
    const { homework_id, content } = req.body;
    const answerText = content !== undefined ? content : req.body.answer_text;
    const hw = await ClassworkHomework.findByPk(homework_id);
    if (!hw) return res.status(404).json({ error: 'Homework not found.' });

    // Check deadline
    if (hw.due_date && new Date(hw.due_date) < new Date()) {
      return res.status(400).json({ error: 'Homework deadline has passed.' });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ where: { homework_id, student_id: req.user.id } });
    if (existing) {
      if (existing.status === 'graded') {
        return res.status(400).json({ error: 'Graded homework cannot be edited or resubmitted.' });
      }

      await existing.update({
        answer_text: answerText !== undefined ? answerText : existing.answer_text,
        file_path: req.file ? req.file.filename : existing.file_path,
        submitted_at: new Date(),
        status: 'submitted',
      });
      return res.json({ message: 'Homework resubmitted successfully!', submission: existing });
    }

    const submission = await Submission.create({
      homework_id,
      student_id: req.user.id,
      answer_text: answerText || null,
      file_path: req.file ? req.file.filename : null,
      submitted_at: new Date(),
      status: 'submitted',
    });
    res.status(201).json({ message: 'Homework submitted successfully!', submission });
  } catch (err) {
    console.error('Submit homework error:', err);
    res.status(500).json({ error: 'Failed to submit homework.' });
  }
};

// ============= MY EXAMS LIST =============
exports.getMyExamsList = async (req, res) => {
  try {
    const { courseIds } = await ensureStudentEnrollments(req.user.id);
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
    });
    const activeCourseIds = Array.from(new Set([
      ...enrollments.map(e => e.course_id),
      ...(courseIds || [])
    ]));

    const exams = await Exam.findAll({
      where: { course_id: { [Op.in]: activeCourseIds }, is_published: true },
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
        type: attempt.exam.type,
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

    // Student Attendance Analytics for Report Card
    const attendanceRecords = await Attendance.findAll({
      where: { user_id: req.user.id, user_role: 'student' },
      order: [['date', 'DESC']],
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
    const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
    const leaveDays = attendanceRecords.filter(a => a.status === 'leave').length;
    const effectivePresent = presentDays + lateDays;
    const attendancePercentage = totalDays > 0 ? ((effectivePresent / totalDays) * 100).toFixed(1) : '100.0';

    const attendanceSummary = {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      percentage: attendancePercentage,
      remark: parseFloat(attendancePercentage) >= 90
        ? 'Excellent Attendance'
        : parseFloat(attendancePercentage) >= 75
        ? 'Good & Regular'
        : 'Attendance Shortage',
    };

    res.json({
      student: { name: profile.user?.full_name, class: profile.class?.display_name, rollNo: profile.roll_number },
      subjects,
      summary: { totalObtained: grandTotal, totalMarks: grandMax, percentage: overallPercentage, grade: getGrade(overallPercentage) },
      attendance: attendanceSummary,
      results: attempts,
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
    await ensureStudentEnrollments(req.user.id);
    const { Module, Lesson } = require('../models');
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id, status: 'active' },
      include: [{
        model: Course, as: 'course',
        include: [
          { model: Class, as: 'class' },
          { model: Subject, as: 'subject' },
          { model: User, as: 'teacher', attributes: ['id', 'full_name', 'email'] },
          { model: CourseMaterial, as: 'materials', required: false },
          { 
            model: Module, as: 'modules', 
            include: [{ model: Lesson, as: 'lessons' }],
          }
        ],
      }],
    });

    const courses = enrollments.map(e => e.course).filter(Boolean).map(c => {
      const courseJson = c.toJSON ? c.toJSON() : c;
      if (courseJson.materials) {
        courseJson.materials.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      }
      if (courseJson.modules) {
        courseJson.modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        courseJson.modules.forEach(m => {
          if (m.lessons) {
            m.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          }
        });
      }
      return courseJson;
    });

    res.json({ courses });
  } catch (err) {
    console.error('Fetch detailed courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

