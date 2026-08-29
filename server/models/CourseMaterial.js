const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseMaterial = sequelize.define('CourseMaterial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('book', 'notes', 'video', 'link', 'document'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    comment: 'Text content or description',
  },
  file_path: {
    type: DataTypes.STRING,
  },
  external_url: {
    type: DataTypes.STRING,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'course_materials',
});

module.exports = CourseMaterial;
