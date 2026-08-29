const { Subject, Class, ClassSubject, Book } = require('../models');
const { Op } = require('sequelize');

// Get all subjects with class count
exports.getAll = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [{ model: Class, as: 'classes', through: { attributes: [] } }],
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });

    const result = subjects.map(sub => ({
      ...sub.toJSON(),
      classesCount: sub.classes?.length || 0,
    }));

    res.json({ subjects: result });
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
};

// Get single subject
exports.getById = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [{ model: Class, as: 'classes', through: { attributes: [] } }],
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    res.json({ subject: { ...subject.toJSON(), classesCount: subject.classes?.length || 0 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject.' });
  }
};

// Create subject
exports.create = async (req, res) => {
  try {
    const { name, name_urdu, code, description, icon, color, sort_order } = req.body;

    if (!name) return res.status(400).json({ error: 'Subject name is required.' });

    if (code) {
      const existing = await Subject.findOne({ where: { code } });
      if (existing) return res.status(400).json({ error: 'A subject with this code already exists.' });
    }

    const subject = await Subject.create({
      name,
      name_urdu: name_urdu || '',
      code: code || '',
      description: description || '',
      icon: icon || '📚',
      color: color || '#64748b',
      sort_order: sort_order || 0,
    });

    res.status(201).json({ message: 'Subject created!', subject });
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: 'Failed to create subject.' });
  }
};

// Update subject
exports.update = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const { name, name_urdu, code, description, icon, color, sort_order, is_active } = req.body;

    // Check unique code if changing
    if (code && code !== subject.code) {
      const existing = await Subject.findOne({ where: { code, id: { [Op.ne]: subject.id } } });
      if (existing) return res.status(400).json({ error: 'A subject with this code already exists.' });
    }

    await subject.update({
      name: name !== undefined ? name : subject.name,
      name_urdu: name_urdu !== undefined ? name_urdu : subject.name_urdu,
      code: code !== undefined ? code : subject.code,
      description: description !== undefined ? description : subject.description,
      icon: icon !== undefined ? icon : subject.icon,
      color: color !== undefined ? color : subject.color,
      sort_order: sort_order !== undefined ? sort_order : subject.sort_order,
      is_active: is_active !== undefined ? is_active : subject.is_active,
    });

    res.json({ message: 'Subject updated!', subject });
  } catch (err) {
    console.error('Update subject error:', err);
    res.status(500).json({ error: 'Failed to update subject.' });
  }
};

// Delete subject
exports.remove = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const booksCount = await Book.count({ where: { subject_id: subject.id } });
    if (booksCount > 0) {
      return res.status(400).json({
        error: `Cannot delete. ${booksCount} book(s) are linked to this subject.`
      });
    }

    // Remove class-subject mappings
    await ClassSubject.destroy({ where: { subject_id: subject.id } });
    await subject.destroy();

    res.json({ message: 'Subject deleted successfully.' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
};

// Toggle active
exports.toggleActive = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    await subject.update({ is_active: !subject.is_active });
    res.json({
      message: `Subject ${subject.is_active ? 'activated' : 'deactivated'}!`,
      subject,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle subject status.' });
  }
};
