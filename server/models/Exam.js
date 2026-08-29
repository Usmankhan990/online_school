const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('quiz', 'midterm', 'final', 'assignment', 'paper'),
    defaultValue: 'quiz',
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  passing_marks: {
    type: DataTypes.INTEGER,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  start_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.DATE,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allow_review: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  auto_grade: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'exams',
});

module.exports = Exam;
