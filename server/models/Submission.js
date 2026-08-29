const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  homework_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  answer_text: {
    type: DataTypes.TEXT,
  },
  file_path: {
    type: DataTypes.STRING,
  },
  marks_obtained: {
    type: DataTypes.DECIMAL(5, 2),
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'returned'),
    defaultValue: 'submitted',
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'submissions',
});

module.exports = Submission;
