const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAttempt = sequelize.define('ExamAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  submitted_at: {
    type: DataTypes.DATE,
  },
  total_obtained: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  grade: {
    type: DataTypes.STRING(5),
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'submitted', 'graded'),
    defaultValue: 'in_progress',
  },
  is_auto_submitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'exam_attempts',
});

module.exports = ExamAttempt;
