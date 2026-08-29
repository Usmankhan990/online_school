const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'KG, 1, 2, 3, 4, 5, 6, 7, 8',
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'KG / Pre-1, Class 1, Class 2, ...',
  },
  grade_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0=KG, 1-8',
  },
  section: {
    type: DataTypes.STRING,
    defaultValue: 'A',
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'classes',
});

module.exports = Class;
