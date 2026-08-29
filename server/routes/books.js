const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, requireRole } = require('../middleware/auth');

// All book routes require authentication
router.use(authenticate);

// ── Public / Student endpoints ──
router.get('/', bookController.getAll);
router.get('/library', bookController.getLibraryBooks);
router.get('/classes', async (req, res) => {
  // Convenience: return classes list for filter dropdowns
  const { Class } = require('../models');
  try {
    const classes = await Class.findAll({ order: [['grade_level', 'ASC']] });
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes.' });
  }
});
router.get('/subjects', async (req, res) => {
  // Convenience: return subjects list for filter dropdowns
  const { Subject } = require('../models');
  try {
    const subjects = await Subject.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

// Must come after static routes but before /:id
router.get('/:id', bookController.getById);

// ── Admin endpoints ──
router.post('/', requireRole('super_admin'), bookController.upload.single('pdf'), bookController.create);
router.put('/:id', requireRole('super_admin'), bookController.upload.single('pdf'), bookController.update);
router.delete('/:id', requireRole('super_admin'), bookController.remove);
router.post('/:id/upload', requireRole('super_admin'), bookController.upload.single('pdf'), bookController.uploadPdf);
router.post('/bulk', requireRole('super_admin'), bookController.bulkCreate);

module.exports = router;
