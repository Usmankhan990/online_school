const express = require('express');
const router = express.Router();
const { Settings } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const DEFAULT_TIMETABLE = {
  columns: [
    { key: 'class', label: 'Class', time: '' },
    { key: 'p1', label: 'P1', time: '8:15 - 8:50' },
    { key: 'p2', label: 'P2', time: '8:50 - 9:25' },
    { key: 'p3', label: 'P3', time: '9:25 - 10:00' },
    { key: 'p4', label: 'P4', time: '10:00 - 10:20' },
    { key: 'break', label: 'BREAK', time: '10:20 - 10:40' },
    { key: 'p5', label: 'P5', time: '10:40 - 11:15' },
    { key: 'p6', label: 'P6', time: '11:15 - 11:50' },
    { key: 'p7', label: 'P7', time: '11:50 - 12:25' },
    { key: 'p8', label: 'P8', time: '12:25 - 1:00' },
  ],
  scheduleData: [
    {
      class: 'Class 1',
      p1: 'English',
      p2: 'Maths',
      p3: 'Urdu',
      p4: 'Nazra Quran',
      break: 'RECESS',
      p5: 'GK',
      p6: 'Drawing',
      p7: 'Story / Activity',
      p8: 'Games / PT',
    },
    {
      class: 'Class 2',
      p1: 'Maths',
      p2: 'Urdu',
      p3: 'English',
      p4: 'GK',
      break: 'RECESS',
      p5: 'Nazra Quran',
      p6: 'Islamiat',
      p7: 'Drawing',
      p8: 'Activity / PT',
    },
    {
      class: 'Class 3',
      p1: 'Urdu',
      p2: 'Science',
      p3: 'Maths',
      p4: 'English',
      break: 'RECESS',
      p5: 'History/Geo',
      p6: 'Nazra Quran',
      p7: 'Islamiat',
      p8: 'Computer',
    },
    {
      class: 'Class 4',
      p1: 'Science',
      p2: 'English',
      p3: 'GK/S.St',
      p4: 'Urdu',
      break: 'RECESS',
      p5: 'Maths',
      p6: 'Computer',
      p7: 'Nazra Quran',
      p8: 'Drawing / PT',
    },
    {
      class: 'Class 5',
      p1: 'History/Geo',
      p2: 'Science',
      p3: 'Urdu',
      p4: 'Maths',
      break: 'RECESS',
      p5: 'English',
      p6: 'Islamiat',
      p7: 'Computer',
      p8: 'Activity / Test',
    },
    {
      class: 'Class 6',
      p1: 'Computer',
      p2: 'History/Geo',
      p3: 'Science',
      p4: 'Islamiat',
      break: 'RECESS',
      p5: 'Urdu',
      p6: 'Maths',
      p7: 'English',
      p8: 'Library / PT',
    },
    {
      class: 'Class 7',
      p1: 'Islamiat',
      p2: 'Computer',
      p3: 'History/Geo',
      p4: 'Science',
      break: 'RECESS',
      p5: 'Maths',
      p6: 'English',
      p7: 'Urdu',
      p8: 'Sports / PT',
    },
    {
      class: 'Class 8',
      p1: 'Drawing / Art',
      p2: 'Islamiat',
      p3: 'Computer',
      p4: 'History/Geo',
      break: 'RECESS',
      p5: 'Science',
      p6: 'Urdu',
      p7: 'Maths',
      p8: 'English',
    },
  ],
};

// GET Timetable (Accessible to super_admin, teacher, student, parent)
router.get('/', authenticate, async (req, res) => {
  try {
    const row = await Settings.findOne({ where: { key: 'master_school_timetable' } });
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        return res.json({ timetable: parsed });
      } catch (parseErr) {
        console.error('Error parsing master_school_timetable:', parseErr);
      }
    }
    return res.json({ timetable: DEFAULT_TIMETABLE });
  } catch (err) {
    console.error('Fetch timetable error:', err);
    return res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// PUT Timetable (Accessible ONLY to super_admin)
router.put('/', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { timetable } = req.body;
    if (!timetable || !Array.isArray(timetable.scheduleData)) {
      return res.status(400).json({ error: 'Invalid timetable data structure.' });
    }

    await Settings.upsert({
      key: 'master_school_timetable',
      value: JSON.stringify(timetable),
    });

    return res.json({ message: 'Timetable updated successfully!', timetable });
  } catch (err) {
    console.error('Update timetable error:', err);
    return res.status(500).json({ error: 'Failed to update timetable' });
  }
});

module.exports = router;
