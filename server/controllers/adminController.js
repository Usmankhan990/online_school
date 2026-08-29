const { sequelize, User, StudentProfile, TeacherProfile, ParentProfile, Class, Subject, ClassSubject, Course, Enrollment, Exam, ExamAttempt, Attendance, Fee, Book, Notification, Document, Settings } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student', status: 'active' } });
    const pendingStudents = await User.count({ where: { role: 'student', status: 'pending' } });
    const totalTeachers = await User.count({ where: { role: 'teacher', status: 'active' } });
    const totalParents = await User.count({ where: { role: 'parent' } });
    const totalCourses = await Course.count();
    const totalExams = await Exam.count();
    const totalFeesPaid = await Fee.sum('amount', { where: { status: 'paid' } }) || 0;
    const totalFeesPending = await Fee.sum('amount', { where: { status: { [Op.in]: ['pending', 'overdue'] } } }) || 0;

    // Recent registrations
    const recentStudents = await User.findAll({
      where: { role: 'student' },
      include: [{ model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: {
        totalStudents,
        pendingStudents,
        totalTeachers,
        totalParents,
        totalCourses,
        totalExams,
        totalFeesPaid,
        totalFeesPending,
      },
      recentStudents: recentStudents.map(s => s.toSafeJSON()),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

// Pending students list
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student', status: 'pending' },
      include: [
        { model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] },
        { model: Document, as: 'documents' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ students: students.map(s => s.toSafeJSON()) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending students.' });
  }
};

// Approve student — also auto-creates parent account and generates first fee
exports.approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found.' });
    }

    await student.update({ status: 'active' });

    // Get student profile
    const profile = await StudentProfile.findOne({ where: { user_id: id } });
    if (profile) {
      // Auto-enroll in class courses
      const courses = await Course.findAll({ where: { class_id: profile.class_id } });
      for (const course of courses) {
        await Enrollment.findOrCreate({
          where: { student_id: id, course_id: course.id },
          defaults: { status: 'active' },
        });
      }

      // Auto-create parent account if not already linked
      if (!profile.parent_id && profile.father_name) {
        const parentEmail = `parent.${student.email}`;
        const existingParent = await User.findOne({ where: { email: parentEmail } });
        
        if (!existingParent) {
          const parentUser = await User.create({
            email: parentEmail,
            password: profile.father_cnic?.replace(/-/g, '') || 'parent123456',
            role: 'parent',
            full_name: profile.father_name,
            phone: profile.contact_number_1,
            status: 'active',
          });

          await ParentProfile.create({
            user_id: parentUser.id,
            relation: 'Father',
            cnic: profile.father_cnic,
          });

          await profile.update({ parent_id: parentUser.id });

          // Notify parent
          await Notification.create({
            user_id: parentUser.id,
            title: 'Welcome to Usman Online School! 👋',
            message: `Your child ${student.full_name} has been admitted. Login with email: ${parentEmail} and password: your CNIC number (without dashes).`,
            type: 'success',
          });
        }
      }

      // Generate first month fee (PKR 1000)
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g. 2026-04
      const existingFee = await Fee.findOne({ where: { student_id: id, month: currentMonth } });
      if (!existingFee) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);
        await Fee.create({
          student_id: id,
          class_id: profile.class_id,
          month: currentMonth,
          amount: 1000,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
        });
      }
    }

    // Send notification to student
    await Notification.create({
      user_id: id,
      title: 'Registration Approved! 🎉',
      message: 'Welcome to Usman Online School! Your registration has been approved. You can now login and access your courses.',
      type: 'success',
    });

    res.json({ message: 'Student approved successfully!' });
  } catch (err) {
    console.error('Approve student error:', err);
    res.status(500).json({ error: 'Failed to approve student.' });
  }
};

// Reject student
exports.rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    await student.update({ status: 'rejected', rejection_reason: reason || 'Not specified' });

    await Notification.create({
      user_id: id,
      title: 'Registration Rejected',
      message: `Your registration was rejected. Reason: ${reason || 'Not specified'}`,
      type: 'error',
    });

    res.json({ message: 'Student rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject student.' });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const { status, class_id } = req.query;
    const where = { role: 'student' };
    if (status) where.status = status;

    const include = [{ model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] }];
    if (class_id) {
      include[0].where = { class_id };
    }

    const students = await User.findAll({ where, include, order: [['created_at', 'DESC']] });
    res.json({ students: students.map(s => s.toSafeJSON()) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
};

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { email, password, full_name, phone, qualification, specialization, experience_years, bio, salary } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists.' });

    const user = await User.create({
      email, password, role: 'teacher', full_name, phone, status: 'active',
    });

    await TeacherProfile.create({
      user_id: user.id, qualification, specialization, experience_years, bio, salary,
    });

    res.status(201).json({ message: 'Teacher created!', teacher: user.toSafeJSON() });
  } catch (err) {
    console.error('Create teacher error:', err);
    res.status(500).json({ error: 'Failed to create teacher.' });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      include: [{ model: TeacherProfile, as: 'teacherProfile' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ teachers: teachers.map(t => t.toSafeJSON()) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teachers.' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'super_admin') return res.status(403).json({ error: 'Cannot delete admin.' });
    await user.destroy();
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

// Manage Classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [{ model: Subject, as: 'subjects' }],
      order: [['grade_level', 'ASC']],
    });
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes.' });
  }
};

// Get subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({ order: [['name', 'ASC']] });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
};

// ==================== FEES MANAGEMENT ====================

// Create single fee
exports.createFee = async (req, res) => {
  try {
    const { student_id, class_id, month, amount, due_date } = req.body;
    const fee = await Fee.create({ student_id, class_id, month, amount: amount || 500, due_date });
    
    await Notification.create({
      user_id: student_id,
      title: 'Fee Generated 💰',
      message: `Fee of Rs. ${amount || 500} for ${month} has been generated. Due date: ${due_date}`,
      type: 'fee',
    });
    
    res.status(201).json({ fee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fee.' });
  }
};

// Generate monthly fees for all active students
exports.generateMonthlyFees = async (req, res) => {
  try {
    const { month, amount } = req.body;
    const feeAmount = amount || 500;

    if (!month) return res.status(400).json({ error: 'Month is required (e.g. 2026-04).' });

    const activeStudents = await User.findAll({
      where: { role: 'student', status: 'active' },
      include: [{ model: StudentProfile, as: 'studentProfile' }],
    });

    let created = 0;
    let skipped = 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    for (const student of activeStudents) {
      if (!student.studentProfile) { skipped++; continue; }

      const existing = await Fee.findOne({
        where: { student_id: student.id, month },
      });
      if (existing) { skipped++; continue; }

      await Fee.create({
        student_id: student.id,
        class_id: student.studentProfile.class_id,
        month,
        amount: feeAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
      });

      await Notification.create({
        user_id: student.id,
        title: 'Monthly Fee Generated 💰',
        message: `Your fee of Rs. ${feeAmount} for ${month} has been generated. Please pay before ${dueDate.toISOString().split('T')[0]}.`,
        type: 'fee',
        link: '/student/fees',
      });

      created++;
    }

    res.json({ message: `Generated ${created} fees, skipped ${skipped} (already exist or no profile).`, created, skipped });
  } catch (err) {
    console.error('Generate fees error:', err);
    res.status(500).json({ error: 'Failed to generate monthly fees.' });
  }
};

// Verify/reject payment
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'verify' or 'reject'

    const fee = await Fee.findByPk(id, {
      include: [{ model: User, as: 'student' }],
    });
    if (!fee) return res.status(404).json({ error: 'Fee not found.' });

    if (action === 'verify') {
      await fee.update({
        status: 'paid',
        verified_by: req.user.id,
        verification_date: new Date(),
        remarks: remarks || 'Payment verified by admin',
      });

      await Notification.create({
        user_id: fee.student_id,
        title: 'Payment Verified ✅',
        message: `Your payment for ${fee.month} has been verified. Thank you!`,
        type: 'success',
      });
    } else {
      await fee.update({
        status: 'pending',
        payment_method: null,
        transaction_id: null,
        payment_proof: null,
        paid_date: null,
        remarks: remarks || 'Payment rejected by admin',
      });

      await Notification.create({
        user_id: fee.student_id,
        title: 'Payment Rejected ❌',
        message: `Your payment for ${fee.month} was rejected. ${remarks || 'Please resubmit with valid proof.'}`,
        type: 'warning',
      });
    }

    res.json({ message: `Payment ${action === 'verify' ? 'verified' : 'rejected'}!`, fee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment.' });
  }
};

exports.updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, transaction_id } = req.body;
    const fee = await Fee.findByPk(id);
    if (!fee) return res.status(404).json({ error: 'Fee not found.' });

    await fee.update({
      status,
      payment_method,
      transaction_id,
      paid_date: status === 'paid' ? new Date() : null,
    });

    res.json({ fee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update fee.' });
  }
};

exports.getAllFees = async (req, res) => {
  try {
    const { status, class_id, month } = req.query;
    const where = {};
    if (status) where.status = status;
    if (class_id) where.class_id = class_id;
    if (month) where.month = month;

    const fees = await Fee.findAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email'] },
        { model: Class, as: 'class' },
      ],
      order: [['created_at', 'DESC']],
    });

    const totalPaid = await Fee.sum('amount', { where: { ...where, status: 'paid' } }) || 0;
    const totalPending = await Fee.sum('amount', { where: { ...where, status: { [Op.in]: ['pending', 'overdue'] } } }) || 0;

    res.json({ fees, totalPaid, totalPending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fees.' });
  }
};

// ==================== BOOKS MANAGEMENT ====================

// Get all books (with filters)
exports.getAllBooks = async (req, res) => {
  try {
    const { class_id, subject_id } = req.query;
    const where = {};
    if (class_id) where.class_id = class_id;
    if (subject_id) where.subject_id = subject_id;

    const books = await Book.findAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' },
      ],
      order: [['class_id', 'ASC'], ['title', 'ASC']],
    });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

// Add single book
exports.addBook = async (req, res) => {
  try {
    const { class_id, subject_id, title, title_urdu, pdf_url, local_file, cover_image, publisher, year, description } = req.body;
    const book = await Book.create({
      class_id, subject_id, title, title_urdu,
      pdf_url, local_file,
      cover_image,
      publisher: publisher || 'PCTB Punjab',
      year: year || 2026,
      description,
    });
    res.status(201).json({ message: 'Book added!', book });
  } catch (err) {
    console.error('Add book error:', err);
    res.status(500).json({ error: 'Failed to add book.' });
  }
};

// Bulk upload books (CSV-style JSON array)
exports.bulkAddBooks = async (req, res) => {
  try {
    const { books } = req.body; // Array of book objects
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of books.' });
    }

    const validated = books.map(b => ({
      class_id: b.class_id,
      subject_id: b.subject_id,
      title: b.title,
      title_urdu: b.title_urdu || '',
      pdf_url: b.pdf_url,
      local_file: b.local_file || '',
      cover_image: b.cover_image || '',
      publisher: b.publisher || 'PCTB Punjab',
      year: b.year || 2026,
      description: b.description || '',
      is_active: true,
    }));

    const created = await Book.bulkCreate(validated);
    res.status(201).json({ message: `${created.length} books uploaded!`, count: created.length });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Failed to bulk upload books.' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });

    const { title, title_urdu, pdf_url, local_file, cover_image, publisher, year, is_active, description } = req.body;
    await book.update({ title, title_urdu, pdf_url, local_file, cover_image, publisher, year, is_active, description });
    res.json({ message: 'Book updated!', book });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book.' });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    await book.destroy();
    res.json({ message: 'Book deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book.' });
  }
};
// ==================== REPORTS & ANALYTICS ====================
exports.getReportsData = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student', status: 'active' } });
    const pendingStudents = await User.count({ where: { role: 'student', status: 'pending' } });
    const totalTeachers = await User.count({ where: { role: 'teacher', status: 'active' } });
    const totalParents = await User.count({ where: { role: 'parent' } });

    const revenueByMonth = await Fee.findAll({
      attributes: ['month', [sequelize.fn('sum', sequelize.col('amount')), 'total']],
      where: { status: 'paid' },
      group: ['month'],
      order: [['month', 'DESC']],
      limit: 12
    });

    res.json({
      enrollment: { totalStudents, pendingStudents, totalTeachers, totalParents },
      revenue: revenueByMonth
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

// ==================== RESULTS OVERVIEW ====================
exports.getResultsStats = async (req, res) => {
  try {
    const attempts = await ExamAttempt.findAll({
      where: { status: 'graded' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name'] },
        { 
          model: Exam, 
          as: 'exam',
          attributes: ['id', 'title', 'total_marks'],
          include: [{ model: Course, as: 'course', include: [{ model: Class, as: 'class' }, { model: Subject, as: 'subject' }] }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({ results: attempts });
  } catch (err) {
    console.error('Results stats error:', err);
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};

// ==================== ATTENDANCE OVERVIEW ====================
exports.getAttendanceStats = async (req, res) => {
  try {
    const { date } = req.query; // optional date filter
    const targetDate = date || new Date().toISOString().split('T')[0];

    const attendanceRecords = await Attendance.findAll({
      where: { date: targetDate },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'role'] },
        { model: Class, as: 'class', attributes: ['id', 'grade_level', 'section'] }
      ]
    });

    const summary = {
      present: attendanceRecords.filter(a => a.status === 'present').length,
      absent: attendanceRecords.filter(a => a.status === 'absent').length,
      late: attendanceRecords.filter(a => a.status === 'late').length,
      leave: attendanceRecords.filter(a => a.status === 'leave').length
    };

    res.json({ date: targetDate, summary, records: attendanceRecords });
  } catch (err) {
    console.error('Attendance stats error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance stats.' });
  }
};

// ==================== NOTIFICATIONS MANAGEMENT ====================

// Get all system notifications (for admin overview)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [['created_at', 'DESC']],
      limit: 100,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'role'] }]
    });
    res.json({ notifications });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

// Send an announcement
exports.sendNotification = async (req, res) => {
  try {
    const { role, title, message, type } = req.body;
    
    const where = { status: 'active' };
    if (role && role !== 'all') where.role = role;

    const users = await User.findAll({ where });
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found matching the selected role.' });
    }

    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type: type || 'info'
    }));

    await Notification.bulkCreate(notifications);
    res.status(201).json({ message: `Announcement sent to ${notifications.length} users.` });
  } catch (err) {
    console.error('Send announcement error:', err);
    res.status(500).json({ error: 'Failed to send announcement.' });
  }
};

// ==================== SYSTEM SETTINGS ====================
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json({ settings: settingsMap });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await Settings.upsert({ key, value: String(value) });
    }
    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};

// ==================== PARENTS MANAGEMENT ====================
exports.getParents = async (req, res) => {
  try {
    const parents = await User.findAll({
      where: { role: 'parent' },
      include: [
        { model: ParentProfile, as: 'parent_profile' }
      ]
    });
    res.json({ parents });
  } catch (err) {
    console.error('Get parents error:', err);
    res.status(500).json({ error: 'Failed to fetch parents.' });
  }
};

// ==================== COURSES OVERVIEW ====================
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'full_name'] },
        { model: Class, as: 'class', attributes: ['id', 'grade_level', 'section'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
      ]
    });
    res.json({ courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// ==================== EXAMS OVERVIEW ====================
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'full_name'] },
        { 
          model: Course, 
          as: 'course',
          include: [
            { model: Class, as: 'class', attributes: ['grade_level', 'section'] },
            { model: Subject, as: 'subject', attributes: ['name'] }
          ]
        }
      ]
    });
    res.json({ exams });
  } catch (err) {
    console.error('Get exams error:', err);
    res.status(500).json({ error: 'Failed to fetch exams.' });
  }
};
