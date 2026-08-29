const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAnswer = sequelize.define('ExamAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  answer_text: {
    type: DataTypes.TEXT,
  },
  file_path: {
    type: DataTypes.STRING,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
  },
  marks_obtained: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  teacher_feedback: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'exam_answers',
});

module.exports = ExamAnswer;
