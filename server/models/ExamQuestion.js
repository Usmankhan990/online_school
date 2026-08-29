const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamQuestion = sequelize.define('ExamQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  question_type: {
    type: DataTypes.ENUM('mcq', 'subjective', 'true_false', 'file_upload'),
    allowNull: false,
  },
  options: {
    type: DataTypes.TEXT,
    comment: 'JSON array of options for MCQ',
  },
  correct_answer: {
    type: DataTypes.TEXT,
    comment: 'Correct answer or expected answer',
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image_url: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'exam_questions',
});

module.exports = ExamQuestion;
