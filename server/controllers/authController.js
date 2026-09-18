const jwt = require('jsonwebtoken');
const { sequelize, User, StudentProfile, TeacherProfile, ParentProfile, Class, Document, Notification } = require('../models');
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
      return res.status(400).json({ error: 'Father CNIC format must be: 00000-0000000-0' });
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

    // Create user with pending status
    const user = await User.create({
      email: normalizedEmail,
      password,
      role: 'student',
      full_name: full_name?.trim(),
      phone: contact_number_1?.trim(),
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
      contact_number_1,
      contact_number_2,
      parent_email: parent_email ? parent_email.trim().toLowerCase() : null,
      parent_id: parentUser ? parentUser.id : null,
      class_id,
      medium: medium || 'English',
      date_of_birth,
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

    const token = generateToken(user);

    res.json({
      token,
      user: user.toSafeJSON(),
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

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
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
