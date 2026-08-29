const { Course, CourseMaterial, Class, Subject, Exam, ExamQuestion, ExamAttempt, ExamAnswer, ClassworkHomework, Submission, Attendance, LiveClass, User, StudentProfile, Enrollment, Notification } = require('../models');
const { Op } = require('sequelize');

// ============= COURSES =============
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { teacher_id: req.user.id },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Enrollment, as: 'enrollments' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { class_id, subject_id, title, description } = req.body;
    const course = await Course.create({
      teacher_id: req.user.id, class_id, subject_id, title, description,
    });

    // Auto-enroll all active students of this class
    const students = await StudentProfile.findAll({
      where: { class_id },
      include: [{ model: User, as: 'user', where: { status: 'active' } }],
    });
    for (const student of students) {
      await Enrollment.findOrCreate({
        where: { student_id: student.user_id, course_id: course.id },
        defaults: { status: 'active' },
      });
    }

    const fullCourse = await Course.findByPk(course.id, {
      include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }],
    });
    res.status(201).json({ course: fullCourse });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.id, teacher_id: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    await course.update(req.body);
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course.' });
  }
};

// Course Materials
exports.addMaterial = async (req, res) => {
  try {
    const { course_id, title, type, content, external_url } = req.body;
    const course = await Course.findOne({ where: { id: course_id, teacher_id: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const material = await CourseMaterial.create({
      course_id, title, type, content, external_url,
      file_path: req.file ? req.file.filename : null,
    });
    res.status(201).json({ material });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add material.' });
  }
};

exports.getCourseMaterials = async (req, res) => {
  try {
    const materials = await CourseMaterial.findAll({
      where: { course_id: req.params.courseId },
      order: [['order_index', 'ASC']],
    });
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials.' });
  }
};

// ============= EXAMS =============
exports.createExam = async (req, res) => {
  try {
    const { course_id, title, description, type, total_marks, passing_marks, duration_minutes, start_time, end_time, questions } = req.body;

    const course = await Course.findOne({ where: { id: course_id, teacher_id: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const exam = await Exam.create({
      course_id, teacher_id: req.user.id, title, description, type,
      total_marks, passing_marks, duration_minutes, start_time, end_time,
    });

    // Add questions
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await ExamQuestion.create({
          exam_id: exam.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options ? JSON.stringify(q.options) : null,
          correct_answer: q.correct_answer,
          marks: q.marks || 1,
          order_index: i,
        });
      }
    }

    const fullExam = await Exam.findByPk(exam.id, {
      include: [{ model: ExamQuestion, as: 'questions' }],
    });
    res.status(201).json({ exam: fullExam });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ error: 'Failed to create exam.' });
  }
};

exports.getMyExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { teacher_id: req.user.id },
      include: [
        { model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] },
        { model: ExamQuestion, as: 'questions' },
        { model: ExamAttempt, as: 'attempts' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams.' });
  }
};

exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, teacher_id: req.user.id } });
    if (!exam) return res.status(404).json({ error: 'Exam not found.' });
    await exam.update({ is_published: true });

    // Notify enrolled students
    const enrollments = await Enrollment.findAll({ where: { course_id: exam.course_id } });
    for (const e of enrollments) {
      await Notification.create({
        user_id: e.student_id,
        title: 'New Exam Published! 📝',
        message: `"${exam.title}" is now available to attempt.`,
        type: 'info',
      });
    }

    res.json({ message: 'Exam published!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish exam.' });
  }
};

// Grade subjective answers
exports.gradeAnswer = async (req, res) => {
  try {
    const { answer_id, marks_obtained, feedback } = req.body;
    const answer = await ExamAnswer.findByPk(answer_id);
    if (!answer) return res.status(404).json({ error: 'Answer not found.' });
    await answer.update({ marks_obtained, teacher_feedback: feedback, is_correct: marks_obtained > 0 });

    // Recalculate attempt total
    const attempt = await ExamAttempt.findByPk(answer.attempt_id, {
      include: [{ model: ExamAnswer, as: 'answers' }, { model: Exam, as: 'exam' }],
    });
    const totalObtained = attempt.answers.reduce((sum, a) => sum + (parseFloat(a.marks_obtained) || 0), 0);
    const percentage = (totalObtained / attempt.exam.total_marks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    await attempt.update({ total_obtained: totalObtained, percentage, grade, status: 'graded' });

    res.json({ message: 'Answer graded!', attempt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade answer.' });
  }
};

// ============= HOMEWORK =============
exports.createHomework = async (req, res) => {
  try {
    const { course_id, title, description, type, due_date, total_marks } = req.body;
    const course = await Course.findOne({ where: { id: course_id, teacher_id: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const hw = await ClassworkHomework.create({
      course_id, teacher_id: req.user.id, title, description,
      type: type || 'homework', due_date, total_marks,
      file_path: req.file ? req.file.filename : null,
    });
    res.status(201).json({ homework: hw });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create homework.' });
  }
};

exports.getMyHomework = async (req, res) => {
  try {
    const homework = await ClassworkHomework.findAll({
      where: { teacher_id: req.user.id },
      include: [
        { model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] },
        { model: Submission, as: 'submissions', include: [{ model: User, as: 'student', attributes: ['id', 'full_name'] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ homework });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch homework.' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;
    const submission = await Submission.findByPk(id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    await submission.update({ marks_obtained, feedback, status: 'graded' });
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade submission.' });
  }
};

// ============= ATTENDANCE =============

// Mark attendance for students in a class
exports.markAttendance = async (req, res) => {
  try {
    const { class_id, date, records } = req.body;
    // records = [{ user_id, status, remarks }]
    for (const record of records) {
      await Attendance.findOrCreate({
        where: { user_id: record.user_id, class_id, date, user_role: 'student' },
        defaults: {
          status: record.status,
          marked_by: req.user.id,
          remarks: record.remarks,
        },
      });
    }
    res.json({ message: 'Attendance marked successfully!' });
  } catch (err) {
    console.error('Mark student attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance.' });
  }
};

// Mark attendance for self (teacher)
exports.markSelfAttendance = async (req, res) => {
  try {
    const { date, status, selfie_path } = req.body;
    const existing = await Attendance.findOne({
      where: { user_id: req.user.id, date, user_role: 'teacher' }
    });

    if (existing) {
      return res.status(400).json({ error: 'Attendance already marked for today.' });
    }

    await Attendance.create({
      user_id: req.user.id,
      user_role: 'teacher',
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'present',
      verification_method: selfie_path ? 'selfie' : 'manual',
      selfie_path,
    });

    res.json({ message: 'Your attendance has been marked!' });
  } catch (err) {
    console.error('Mark self attendance error:', err);
    res.status(500).json({ error: 'Failed to mark self attendance.' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { class_id, date, user_id, role } = req.query;
    const where = { user_role: role || 'student' };
    if (class_id) where.class_id = class_id;
    if (date) where.date = date;
    if (user_id) where.user_id = user_id;

    const attendance = await Attendance.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name'] },
        { model: Class, as: 'class' },
      ],
      order: [['date', 'DESC']],
    });
    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
};

// ============= LIVE CLASSES =============
exports.createLiveClass = async (req, res) => {
  try {
    const { course_id, title, description, meeting_url, scheduled_at, duration_minutes } = req.body;
    
    // Verify teacher owns this course
    const course = await Course.findOne({
      where: { id: course_id, teacher_id: req.user.id },
      include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }],
    });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const liveClass = await LiveClass.create({
      course_id, teacher_id: req.user.id, title, description, meeting_url, scheduled_at, duration_minutes,
    });

    // Auto-notify all students enrolled in this course
    const enrollments = await Enrollment.findAll({ where: { course_id, status: 'active' } });
    const scheduledDate = new Date(scheduled_at);
    const timeStr = scheduledDate.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });

    for (const enrollment of enrollments) {
      await Notification.create({
        user_id: enrollment.student_id,
        title: '📹 Live Class Scheduled!',
        message: `"${title}" for ${course.subject?.name || 'your course'} (${course.class?.display_name}) is scheduled on ${timeStr}. Duration: ${duration_minutes || 45} mins. Be online and ready!`,
        type: 'info',
        link: '/student/live-classes',
      });
    }

    // Also notify parents of enrolled students
    const studentIds = enrollments.map(e => e.student_id);
    const studentProfiles = await StudentProfile.findAll({
      where: { user_id: { [Op.in]: studentIds }, parent_id: { [Op.ne]: null } },
    });
    for (const sp of studentProfiles) {
      await Notification.create({
        user_id: sp.parent_id,
        title: '📹 Live Class for Your Child',
        message: `A live class "${title}" for ${course.subject?.name || 'a course'} is scheduled on ${timeStr}.`,
        type: 'info',
      });
    }

    const fullLiveClass = await LiveClass.findByPk(liveClass.id, {
      include: [{ model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] }],
    });

    res.status(201).json({ liveClass: fullLiveClass, notified: enrollments.length });
  } catch (err) {
    console.error('Create live class error:', err);
    res.status(500).json({ error: 'Failed to create live class.' });
  }
};

exports.getMyLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.findAll({
      where: { teacher_id: req.user.id },
      include: [{ model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] }],
      order: [['scheduled_at', 'DESC']],
    });
    res.json({ liveClasses: classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live classes.' });
  }
};

exports.updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, recording_url, meeting_url, title, description, scheduled_at, duration_minutes } = req.body;
    
    const liveClass = await LiveClass.findOne({
      where: { id, teacher_id: req.user.id }
    });
    
    if (!liveClass) return res.status(404).json({ error: 'Live class not found or unauthorized.' });
    
    await liveClass.update({
      status, recording_url, meeting_url, title, description, scheduled_at, duration_minutes
    });
    
    res.json({ message: 'Live class updated successfully!', liveClass });
  } catch (err) {
    console.error('Update live class error:', err);
    res.status(500).json({ error: 'Failed to update live class.' });
  }
};

// Get students for a class (for attendance)
exports.getClassStudents = async (req, res) => {
  try {
    const { class_id } = req.query;
    if (!class_id) return res.status(400).json({ error: 'class_id is required.' });

    const students = await StudentProfile.findAll({
      where: { class_id },
      include: [{ model: User, as: 'user', where: { status: 'active' }, attributes: ['id', 'full_name', 'email'] }],
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
};

// Teacher Dashboard Stats
exports.getTeacherDashboard = async (req, res) => {
  try {
    const coursesCount = await Course.count({ where: { teacher_id: req.user.id } });
    const examsCount = await Exam.count({ where: { teacher_id: req.user.id } });
    const homeworkCount = await ClassworkHomework.count({ where: { teacher_id: req.user.id } });

    const courses = await Course.findAll({
      where: { teacher_id: req.user.id },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
        { model: Enrollment, as: 'enrollments' },
      ],
    });

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollments ? c.enrollments.length : 0), 0);

    const pendingSubmissions = await Submission.count({
      where: { status: 'submitted' },
      include: [{
        model: ClassworkHomework, as: 'homework',
        where: { teacher_id: req.user.id },
      }],
    });

    const upcomingLiveClasses = await LiveClass.count({
      where: { teacher_id: req.user.id, status: 'scheduled', scheduled_at: { [Op.gte]: new Date() } },
    });

    // Recent notifications for teacher
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: { coursesCount, examsCount, homeworkCount, totalStudents, pendingSubmissions, upcomingLiveClasses },
      totalCourses: coursesCount,
      totalStudents,
      pendingSubmissions,
      upcomingExams: examsCount,
      courses,
      notifications,
    });
  } catch (err) {
    console.error('Teacher dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

// ============= MATERIALS LIST =============
exports.getMyMaterials = async (req, res) => {
  try {
    const courses = await Course.findAll({ where: { teacher_id: req.user.id }, attributes: ['id'] });
    const courseIds = courses.map(c => c.id);

    const materials = await CourseMaterial.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      include: [{ model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials.' });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }],
    });
    if (!material || material.course.teacher_id !== req.user.id) {
      return res.status(404).json({ error: 'Material not found.' });
    }
    await material.destroy();
    res.json({ message: 'Material deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material.' });
  }
};

// ============= SUBMISSIONS LIST =============
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email'] },
        {
          model: ClassworkHomework, as: 'homework',
          where: { teacher_id: req.user.id },
          include: [{ model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }, { model: Class, as: 'class' }] }],
        },
      ],
      order: [['submitted_at', 'DESC']],
    });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
};

// ============= RESULTS =============
exports.getMyResults = async (req, res) => {
  try {
    const attempts = await ExamAttempt.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email'] },
        {
          model: Exam, as: 'exam',
          where: { teacher_id: req.user.id },
          include: [
            { model: Course, as: 'course', include: [{ model: Subject, as: 'subject' }, { model: Class, as: 'class' }] },
            { model: ExamQuestion, as: 'questions' },
          ],
        },
        { model: ExamAnswer, as: 'answers' },
      ],
      order: [['submitted_at', 'DESC']],
    });
    res.json({ results: attempts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};

// ============= NOTIFICATIONS =============
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

