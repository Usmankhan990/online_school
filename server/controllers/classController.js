const { Class, Subject, ClassSubject, Book, StudentProfile, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all classes with counts
exports.getAll = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [{ model: Subject, as: 'subjects', through: { attributes: [] } }],
      order: [['grade_level', 'ASC'], ['sort_order', 'ASC']],
    });

    // Get counts
    const result = await Promise.all(classes.map(async (cls) => {
      const booksCount = await Book.count({ where: { class_id: cls.id } });
      const studentsCount = await StudentProfile.count({ where: { class_id: cls.id } });
      return {
        ...cls.toJSON(),
        booksCount,
        studentsCount,
        subjectsCount: cls.subjects?.length || 0,
      };
    }));

    res.json({ classes: result });
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ error: 'Failed to fetch classes.' });
  }
};

// Get single class
exports.getById = async (req, res) => {
  try {
    const cls = await Class.findByPk(req.params.id, {
      include: [{ model: Subject, as: 'subjects', through: { attributes: [] } }],
    });
    if (!cls) return res.status(404).json({ error: 'Class not found.' });

    const booksCount = await Book.count({ where: { class_id: cls.id } });
    const studentsCount = await StudentProfile.count({ where: { class_id: cls.id } });

    res.json({
      class: {
        ...cls.toJSON(),
        booksCount,
        studentsCount,
        subjectsCount: cls.subjects?.length || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class.' });
  }
};

// Create class
exports.create = async (req, res) => {
  try {
    const { name, display_name, grade_level, section, description, sort_order } = req.body;

    if (!name || !display_name || grade_level === undefined) {
      return res.status(400).json({ error: 'Name, display name, and grade level are required.' });
    }

    const existing = await Class.findOne({ where: { name } });
    if (existing) return res.status(400).json({ error: 'A class with this name already exists.' });

    const cls = await Class.create({
      name,
      display_name,
      grade_level: parseInt(grade_level),
      section: section || 'A',
      description: description || '',
      sort_order: sort_order || 0,
    });

    res.status(201).json({ message: 'Class created successfully!', class: cls });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Failed to create class.' });
  }
};

// Update class
exports.update = async (req, res) => {
  try {
    const cls = await Class.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found.' });

    const { name, display_name, grade_level, section, description, sort_order, is_active } = req.body;

    // Check unique name if changing
    if (name && name !== cls.name) {
      const existing = await Class.findOne({ where: { name, id: { [Op.ne]: cls.id } } });
      if (existing) return res.status(400).json({ error: 'A class with this name already exists.' });
    }

    await cls.update({
      name: name !== undefined ? name : cls.name,
      display_name: display_name !== undefined ? display_name : cls.display_name,
      grade_level: grade_level !== undefined ? parseInt(grade_level) : cls.grade_level,
      section: section !== undefined ? section : cls.section,
      description: description !== undefined ? description : cls.description,
      sort_order: sort_order !== undefined ? sort_order : cls.sort_order,
      is_active: is_active !== undefined ? is_active : cls.is_active,
    });

    res.json({ message: 'Class updated!', class: cls });
  } catch (err) {
    console.error('Update class error:', err);
    res.status(500).json({ error: 'Failed to update class.' });
  }
};

// Delete class
exports.remove = async (req, res) => {
  try {
    const cls = await Class.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found.' });

    // Check dependencies
    const studentsCount = await StudentProfile.count({ where: { class_id: cls.id } });
    if (studentsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete. ${studentsCount} student(s) are enrolled in this class.`
      });
    }

    const booksCount = await Book.count({ where: { class_id: cls.id } });
    if (booksCount > 0) {
      return res.status(400).json({
        error: `Cannot delete. ${booksCount} book(s) are linked to this class. Remove them first.`
      });
    }

    // Remove class-subject mappings
    await ClassSubject.destroy({ where: { class_id: cls.id } });
    await cls.destroy();

    res.json({ message: 'Class deleted successfully.' });
  } catch (err) {
    console.error('Delete class error:', err);
    res.status(500).json({ error: 'Failed to delete class.' });
  }
};

// Toggle active
exports.toggleActive = async (req, res) => {
  try {
    const cls = await Class.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found.' });

    await cls.update({ is_active: !cls.is_active });
    res.json({
      message: `Class ${cls.is_active ? 'activated' : 'deactivated'}!`,
      class: cls
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle class status.' });
  }
};

// Get subjects assigned to a class
exports.getSubjects = async (req, res) => {
  try {
    const cls = await Class.findByPk(req.params.id, {
      include: [{ model: Subject, as: 'subjects', through: { attributes: [] } }],
    });
    if (!cls) return res.status(404).json({ error: 'Class not found.' });
    res.json({ subjects: cls.subjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class subjects.' });
  }
};

// Assign subjects to a class (sync: receives full array of subject IDs)
exports.assignSubjects = async (req, res) => {
  try {
    const { subject_ids } = req.body;
    const cls = await Class.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found.' });

    if (!Array.isArray(subject_ids)) {
      return res.status(400).json({ error: 'subject_ids must be an array.' });
    }

    // Remove all existing mappings and create new ones
    await ClassSubject.destroy({ where: { class_id: cls.id } });

    if (subject_ids.length > 0) {
      const mappings = subject_ids.map(sid => ({
        class_id: cls.id,
        subject_id: sid,
      }));
      await ClassSubject.bulkCreate(mappings);
    }

    // Return updated class with subjects
    const updated = await Class.findByPk(cls.id, {
      include: [{ model: Subject, as: 'subjects', through: { attributes: [] } }],
    });

    res.json({
      message: `${subject_ids.length} subject(s) assigned to ${cls.display_name}!`,
      class: updated,
    });
  } catch (err) {
    console.error('Assign subjects error:', err);
    res.status(500).json({ error: 'Failed to assign subjects.' });
  }
};
