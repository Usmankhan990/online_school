const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content_type: {
    type: DataTypes.ENUM('video', 'text', 'pdf', 'quiz', 'assignment'),
    defaultValue: 'text',
  },
  text_content: {
    type: DataTypes.TEXT,
  },
  video_url: {
    type: DataTypes.STRING,
  },
  file_url: {
    type: DataTypes.STRING,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'lessons',
});

module.exports = Lesson;
