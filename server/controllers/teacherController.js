const { Course, CourseMaterial, Class, Subject, Exam, ExamQuestion, ExamAttempt, ExamAnswer, ClassworkHomework, Submission, Attendance, LiveClass, User, StudentProfile, Enrollment, Notification } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

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
      is_published: true, // Auto publish so students can see and solve it
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

    // Auto-notify all students enrolled in this course and their parents
    const enrollments = await Enrollment.findAll({ where: { course_id, status: 'active' } });
    const studentIds = enrollments.map(e => e.student_id);

    // Notify students
    for (const enrollment of enrollments) {
      await Notification.create({
        user_id: enrollment.student_id,
        title: 'New Exam Added! 📝',
        message: `"${exam.title}" is now available to attempt.`,
        type: 'info',
        link: '/student/exams',
      });
    }

    // Notify parents
    const studentProfiles = await StudentProfile.findAll({
      where: { user_id: { [Op.in]: studentIds }, parent_id: { [Op.ne]: null } },
    });
    for (const sp of studentProfiles) {
      await Notification.create({
        user_id: sp.parent_id,
        title: 'New Exam for Your Child 📝',
        message: `A new exam "${exam.title}" has been added for your child.`,
        type: 'info',
      });
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
    const { course_id, title, description, type, due_date, total_marks, book_pages } = req.body;
    const course = await Course.findOne({ where: { id: course_id, teacher_id: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    let mainFile = null;
    let pageImages = [];

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(f => {
          if (f.fieldname === 'file') {
            mainFile = f.filename;
          } else {
            pageImages.push(f.filename);
          }
        });
      } else {
        if (req.files.file && req.files.file[0]) {
          mainFile = req.files.file[0].filename;
        }
        if (req.files.page_images && Array.isArray(req.files.page_images)) {
          pageImages = req.files.page_images.map(f => f.filename);
        }
      }
    } else if (req.file) {
      mainFile = req.file.filename;
    }

    const hw = await ClassworkHomework.create({
      course_id,
      teacher_id: req.user.id,
      title,
      description,
      type: type || 'homework',
      due_date,
      total_marks,
      file_path: mainFile,
      book_pages: book_pages ? book_pages.trim() : null,
      page_images: pageImages.length > 0 ? JSON.stringify(pageImages) : null,
    });

    // Auto-notify all students enrolled in this course or class
    try {
      const enrollments = await Enrollment.findAll({ where: { course_id, status: 'active' } });
      let studentIds = enrollments.map(e => e.student_id);

      if (course.class_id) {
        const classProfiles = await StudentProfile.findAll({ where: { class_id: course.class_id } });
        const classStudentIds = classProfiles.map(p => p.user_id);
        studentIds = Array.from(new Set([...studentIds, ...classStudentIds]));
      }

      const pageDetail = book_pages ? ` (Book Pages: ${book_pages})` : '';

      // Notify students
      for (const sId of studentIds) {
        await Notification.create({
          user_id: sId,
          title: 'New Homework Assigned! 📝',
          message: `"${title}" has been assigned for ${course.title || 'your class'}.${pageDetail}`,
          type: 'homework',
          link: '/student/homework',
        });
      }

      // Notify parents
      if (studentIds.length > 0) {
        const studentProfiles = await StudentProfile.findAll({
          where: { user_id: { [Op.in]: studentIds }, parent_id: { [Op.ne]: null } },
        });
        for (const sp of studentProfiles) {
          if (sp.parent_id) {
            await Notification.create({
              user_id: sp.parent_id,
              title: 'New Homework for Your Child 📝',
              message: `New homework "${title}" has been assigned for your child.${pageDetail}`,
              type: 'homework',
              link: '/parent/homework',
            });
          }
        }
      }
    } catch (notifErr) {
      console.error('Homework notification error (non-fatal):', notifErr);
    }

    res.status(201).json({ homework: hw });
  } catch (err) {
    console.error('Create homework error:', err);
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
    // records = [{ student_id, status, remarks }]
    for (const record of records) {
      const uid = record.user_id || record.student_id;
      if (!uid) continue;
      
      const existing = await Attendance.findOne({
        where: { user_id: uid, class_id, date, user_role: 'student' }
      });
      
      if (existing) {
        await existing.update({ status: record.status, remarks: record.remarks });
      } else {
        await Attendance.create({
          user_id: uid,
          class_id,
          date,
          user_role: 'student',
          status: record.status,
          marked_by: req.user.id,
          remarks: record.remarks,
        });
      }
    }
    res.json({ message: 'Attendance marked successfully!' });
  } catch (err) {
    console.error('Mark student attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance.' });
  }
};

// Mark attendance for self (teacher) via live selfie
exports.markSelfAttendance = async (req, res) => {
  try {
    const { selfie_data, status, date } = req.body;
    const today = date || new Date().toISOString().split('T')[0];

    let selfiePath = null;
    if (selfie_data) {
      const dir = path.join(__dirname, '..', 'uploads', 'attendance');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const base64Data = selfie_data.replace(/^data:image\/\w+;base64,/, '');
      const filename = `teacher-selfie-${req.user.id}-${Date.now()}.jpg`;
      fs.writeFileSync(path.join(dir, filename), base64Data, 'base64');
      selfiePath = `/uploads/attendance/${filename}`;
    }

    const existing = await Attendance.findOne({
      where: { user_id: req.user.id, date: today, user_role: 'teacher' }
    });

    let attendance;
    if (existing) {
      await existing.update({
        status: status || 'present',
        verification_method: selfiePath ? 'selfie' : existing.verification_method,
        selfie_path: selfiePath || existing.selfie_path,
        remarks: 'Teacher live selfie attendance'
      });
      attendance = existing;
    } else {
      attendance = await Attendance.create({
        user_id: req.user.id,
        user_role: 'teacher',
        date: today,
        status: status || 'present',
        verification_method: selfiePath ? 'selfie' : 'manual',
        selfie_path: selfiePath,
        remarks: 'Teacher live selfie attendance'
      });
    }

    res.json({ message: 'Teacher attendance marked successfully via live selfie!', attendance });
  } catch (err) {
    console.error('Mark self attendance error:', err);
    res.status(500).json({ error: 'Failed to mark teacher attendance.' });
  }
};

// Get teacher's own attendance history
exports.getMySelfAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const where = { user_id: req.user.id, user_role: 'teacher' };
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
      order: [['date', 'DESC']]
    });

    const all = await Attendance.findAll({ where: { user_id: req.user.id, user_role: 'teacher' } });
    const totalDays = all.length;
    const presentDays = all.filter(a => a.status === 'present' || a.status === 'late').length;

    res.json({
      attendance,
      stats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0'
      }
    });
  } catch (err) {
    console.error('Get teacher self attendance error:', err);
    res.status(500).json({ error: 'Failed to fetch teacher attendance.' });
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
    const { course_id, status, recording_url, meeting_url, title, description, scheduled_at, duration_minutes } = req.body;
    
    const liveClass = await LiveClass.findOne({
      where: { id, teacher_id: req.user.id }
    });
    
    if (!liveClass) return res.status(404).json({ error: 'Live class not found or unauthorized.' });
    
    const updateData = {};
    if (course_id) updateData.course_id = course_id;
    if (status) updateData.status = status;
    if (recording_url !== undefined) updateData.recording_url = recording_url;
    if (meeting_url !== undefined) updateData.meeting_url = meeting_url;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;

    await liveClass.update(updateData);

    const updated = await LiveClass.findByPk(liveClass.id, {
      include: [{ model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] }],
    });
    
    res.json({ message: 'Live class updated successfully!', liveClass: updated });
  } catch (err) {
    console.error('Update live class error:', err);
    res.status(500).json({ error: 'Failed to update live class.' });
  }
};

exports.deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findOne({
      where: { id, teacher_id: req.user.id }
    });
    if (!liveClass) return res.status(404).json({ error: 'Live class not found or unauthorized.' });
    
    await liveClass.destroy();
    res.json({ message: 'Live class deleted successfully!' });
  } catch (err) {
    console.error('Delete live class error:', err);
    res.status(500).json({ error: 'Failed to delete live class.' });
  }
};

// Get students for a class (for attendance)
exports.getClassStudents = async (req, res) => {
  try {
    const { class_id } = req.query;
    if (!class_id) return res.status(400).json({ error: 'class_id is required.' });

    const students = await StudentProfile.findAll({
      where: { class_id: parseInt(class_id) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'avatar', 'phone', 'status'],
        },
      ],
      order: [['user_id', 'ASC']],
    });

    res.json({ students: students.filter(s => s.user) });
  } catch (err) {
    console.error('Get class students error:', err);
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

