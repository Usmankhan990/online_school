const jwt = require('jsonwebtoken');
const { User, StudentProfile, TeacherProfile, ParentProfile, Class, Document, Notification } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Student Registration (Free Signup - Pending Approval)
exports.registerStudent = async (req, res) => {
  try {
    const {
      email, password, full_name, phone,
      father_name, mother_name, father_cnic,
      contact_number_1, contact_number_2,
      class_id, medium, date_of_birth, address,
    } = req.body;

    // Validate CNIC format
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(father_cnic)) {
      return res.status(400).json({ error: 'Father CNIC format must be: 00000-0000000-0' });
    }

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
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
      email,
      password,
      role: 'student',
      full_name,
      phone: contact_number_1,
      status: 'pending',
    });

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

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ 
      where: { email },
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

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = await User.create({
      email, password, role: 'parent', full_name, phone, status: 'active',
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
