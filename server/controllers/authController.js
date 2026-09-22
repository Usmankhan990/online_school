const jwt = require('jsonwebtoken');
const { sequelize, User, StudentProfile, TeacherProfile, ParentProfile, Class, Document, Notification, Course, Enrollment } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'usman_online_school_jwt_secret_2026_very_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Student Registration (Free Signup - Pending Approval)
exports.registerStudent = async (req, res) => {
  try {
    const {
      email, password, full_name, phone,
      gender, guardian_relation,
      father_name, mother_name, father_cnic,
      contact_number_1, contact_number_2, parent_email,
      class_id, medium, date_of_birth, address,
    } = req.body;

    if (!parent_email || !parent_email.trim()) {
      return res.status(400).json({ error: 'Parent email is required.' });
    }

    // Validate CNIC format
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(father_cnic)) {
      return res.status(400).json({ error: `${guardian_relation || 'Parent'} CNIC format must be: 00000-0000000-0` });
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // Check duplicate email (case-insensitive)
    const existing = await User.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
    });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Check class exists
    const classObj = await Class.findByPk(class_id);
    if (!classObj) {
      return res.status(400).json({ error: 'Invalid class selected.' });
    }

    const studentContact = (contact_number_1 || phone || '').trim();

    // Create user with pending status
    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'student',
      full_name: full_name?.trim(),
      phone: studentContact,
      gender: gender || 'Male',
      status: 'pending',
    });

    // Check if parent user exists with parent_email
    let parentUser = null;
    if (parent_email) {
      parentUser = await User.findOne({
        where: {
          [Op.and]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), parent_email.trim().toLowerCase()),
            { role: 'parent' }
          ]
        }
      });
    }

    // Generate roll number
    const studentCount = await StudentProfile.count();
    const rollNumber = `UOS-${new Date().getFullYear()}-${String(studentCount + 1).padStart(4, '0')}`;

    // Create student profile
    await StudentProfile.create({
      user_id: user.id,
      father_name,
      mother_name,
      father_cnic,
      contact_number_1: studentContact,
      contact_number_2,
      parent_email: parent_email ? parent_email.trim().toLowerCase() : null,
      parent_id: parentUser ? parentUser.id : null,
      class_id,
      medium: medium || 'English',
      date_of_birth,
      gender: gender || 'Male',
      guardian_relation: guardian_relation || 'Father',
      address,
      roll_number: rollNumber,
    });

    // Handle document uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await Document.create({
          user_id: user.id,
          title: file.originalname,
          type: 'leaving_certificate',
          file_path: file.filename,
          file_size: file.size,
          mime_type: file.mimetype,
        });
      }
    }

    // Notify admin
    const admins = await User.findAll({ where: { role: 'super_admin' } });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin.id,
        title: 'New Student Registration',
        message: `${full_name} has registered for ${classObj.display_name}. Pending approval.`,
        type: 'approval',
        link: '/admin/pending-students',
      });
    }

    res.status(201).json({
      message: 'Registration submitted successfully! Please wait for admin approval.',
      roll_number: rollNumber,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// Trial Student Registration
exports.registerTrialStudent = async (req, res) => {
  try {
    const { full_name, email_or_phone, class_id, password } = req.body;
    
    if (!full_name || !email_or_phone || !class_id || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const isEmail = email_or_phone.includes('@');
    const normalizedEmail = isEmail 
      ? email_or_phone.trim().toLowerCase() 
      : `${email_or_phone.trim().replace(/[^0-9]/g, '')}@trial.local`;
      
    const existing = await User.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Account with this email/phone already exists.' });
    }

    const classObj = await Class.findByPk(class_id);
    if (!classObj) {
      return res.status(400).json({ error: 'Invalid class selected.' });
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'student',
      full_name: full_name.trim(),
      phone: isEmail ? null : email_or_phone.trim(),
      status: 'trial',
    });

    const studentCount = await StudentProfile.count();
    let rollNumber = `UOS-${new Date().getFullYear()}-T${String(studentCount + 1).padStart(4, '0')}`;
    let existsRoll = await StudentProfile.findOne({ where: { roll_number: rollNumber } });
    let counter = studentCount + 1;
    while (existsRoll) {
      counter++;
      rollNumber = `UOS-${new Date().getFullYear()}-T${String(counter).padStart(4, '0')}`;
      existsRoll = await StudentProfile.findOne({ where: { roll_number: rollNumber } });
    }

    await StudentProfile.create({
      user_id: user.id,
      father_name: full_name.trim(),
      mother_name: 'Trial',
      father_cnic: '00000-0000000-0',
      contact_number_1: isEmail ? '00000000000' : email_or_phone.trim(),
      class_id,
      roll_number: rollNumber,
    });

    // Auto-enroll trial student in all existing courses of their class
    try {
      const classCourses = await Course.findAll({ where: { class_id } });
      for (const course of classCourses) {
        await Enrollment.findOrCreate({
          where: { student_id: user.id, course_id: course.id },
          defaults: { status: 'active' },
        });
      }
    } catch (enrollErr) {
      console.error('Auto-enroll error in trial register:', enrollErr);
    }

    const fullUser = await User.findByPk(user.id, {
      include: [
        { model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] },
      ],
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: fullUser ? fullUser.toSafeJSON() : user.toSafeJSON(),
      password,
      email: normalizedEmail,
    });
  } catch (err) {
    console.error('Trial Register error:', err);
    res.status(500).json({ error: 'Failed to start free trial.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    
    const user = await User.findOne({ 
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
      include: [
        { model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] },
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: ParentProfile, as: 'parentProfile' },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending admin approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Your registration was rejected.',
        reason: user.rejection_reason,
      });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' });
    }

    // Trial Expiration check
    if (user.status === 'trial') {
      const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
      if (new Date() - new Date(user.createdAt) > trialDuration) {
        return res.status(403).json({ error: 'Your 3-day free trial has expired. Please contact admin to upgrade.' });
      }
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // If student, ensure auto-enrollment in all active class courses
    if (user.role === 'student' && user.studentProfile?.class_id) {
      try {
        const classCourses = await Course.findAll({ where: { class_id: user.studentProfile.class_id } });
        for (const course of classCourses) {
          await Enrollment.findOrCreate({
            where: { student_id: user.id, course_id: course.id },
            defaults: { status: 'active' },
          });
        }
      } catch (enrollErr) {
        console.error('Auto-enroll error on login:', enrollErr);
      }
    }

    const studentProfile = await StudentProfile.findOne({ where: { user_id: user.id } });
    const parentProfile = await ParentProfile.findOne({ where: { user_id: user.id } });
    const teacherProfile = await TeacherProfile.findOne({ where: { user_id: user.id } });

    const userJson = user.toSafeJSON();
    if (!userJson.phone) {
      userJson.phone = studentProfile?.contact_number_1 || parentProfile?.phone || teacherProfile?.phone || '';
      if (userJson.phone) {
        await User.update({ phone: userJson.phone }, { where: { id: user.id } });
      }
    }

    const token = generateToken(user);

    res.json({
      token,
      user: userJson,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: StudentProfile, as: 'studentProfile', include: [{ model: Class, as: 'class' }] },
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: ParentProfile, as: 'parentProfile' },
      ],
    });

    const userJson = user.toSafeJSON();
    if (!userJson.phone) {
      userJson.phone = user.studentProfile?.contact_number_1 || user.parentProfile?.phone || user.teacherProfile?.phone || '';
      if (userJson.phone) {
        await User.update({ phone: userJson.phone }, { where: { id: user.id } });
      }
    }

    res.json({ user: userJson });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email, phone, current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password if changing password
    if (new_password && new_password.trim()) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await user.comparePassword(current_password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
      if (new_password.trim().length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      user.password = new_password.trim();
    }

    if (full_name && full_name.trim()) {
      user.full_name = full_name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
        });
        if (existing && existing.id !== user.id) {
          return res.status(400).json({ error: 'Email is already in use by another account.' });
        }
        user.email = normalizedEmail;
      }
    }

    if (req.file) {
      user.avatar = req.file.filename;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: user.toSafeJSON(),
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
};

// Register Parent
exports.registerParent = async (req, res) => {
  try {
    const { email, password, full_name, phone, relation, cnic, occupation, address, student_roll_number } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    const existing = await User.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
    });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = await User.create({
      email: normalizedEmail, password, role: 'parent', full_name: full_name?.trim(), phone: phone?.trim(), status: 'active',
    });

    await ParentProfile.create({
      user_id: user.id, relation, cnic, occupation, address,
    });

    // Link to student if roll number provided
    if (student_roll_number) {
      const student = await StudentProfile.findOne({ where: { roll_number: student_roll_number } });
      if (student) {
        await student.update({ parent_id: user.id });
      }
    }

    const token = generateToken(user);
    res.status(201).json({ token, user: user.toSafeJSON(), message: 'Parent account created!' });
  } catch (err) {
    console.error('Parent register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

// Get unread notifications count
exports.getUnreadNotificationsCount = async (req, res) => {
  try {
    const targetUserIds = [req.user.id];
    if (req.user.role === 'parent') {
      const children = await StudentProfile.findAll({
        where: { parent_id: req.user.id },
        attributes: ['user_id'],
      });
      targetUserIds.push(...children.map(c => c.user_id));
    }
    const count = await Notification.count({
      where: { user_id: { [Op.in]: targetUserIds }, is_read: false }
    });
    res.json({ unread_count: count });
  } catch (err) {
    console.error('Fetch unread notifications count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread notifications count.' });
  }
};

// Forgot Password - Request Reset Link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), normalizedEmail),
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (user.status === 'suspended' || user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account is currently inactive. Please contact administration.' });
    }

    // Generate 1-hour secure reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'pwd_reset' },
      process.env.JWT_SECRET || 'usman_online_school_jwt_secret_2026_very_secure',
      { expiresIn: '1h' }
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    try {
      await Notification.create({
        user_id: user.id,
        title: 'Password Reset Requested',
        message: 'A password reset request was initiated for your account.',
        type: 'system',
      });
    } catch (notifErr) {
      // ignore
    }

    res.json({
      message: 'Password reset link generated successfully.',
      reset_url: `/reset-password?token=${resetToken}`,
      reset_token: resetToken,
      email: user.email,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
};

// Verify Reset Token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Reset token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'usman_online_school_jwt_secret_2026_very_secure');
    } catch (jwtErr) {
      return res.status(400).json({ error: 'Password reset link has expired or is invalid.' });
    }

    if (decoded.type !== 'pwd_reset') {
      return res.status(400).json({ error: 'Invalid reset token type.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({
      valid: true,
      email: user.email,
      name: user.full_name,
    });
  } catch (err) {
    console.error('Verify reset token error:', err);
    res.status(500).json({ error: 'Failed to verify token.' });
  }
};

// Reset Password - Set New Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Reset token is required.' });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'usman_online_school_jwt_secret_2026_very_secure');
    } catch (jwtErr) {
      return res.status(400).json({ error: 'Password reset link has expired or is invalid.' });
    }

    if (decoded.type !== 'pwd_reset') {
      return res.status(400).json({ error: 'Invalid reset token type.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User account no longer exists.' });
    }

    user.password = new_password;
    await user.save();

    try {
      await Notification.create({
        user_id: user.id,
        title: 'Password Changed Successfully',
        message: 'Your account password has been reset. You can now sign in with your new password.',
        type: 'system',
      });
    } catch (notifErr) {
      // ignore
    }

    res.json({
      message: 'Password reset successfully! You can now log in with your new password.',
      success: true,
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Verify current password live
exports.verifyCurrentPassword = async (req, res) => {
  try {
    const { current_password } = req.body;
    if (!current_password) {
      return res.json({ valid: false });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await user.comparePassword(current_password);
    return res.json({ valid: isMatch });
  } catch (err) {
    return res.json({ valid: false });
  }
};
