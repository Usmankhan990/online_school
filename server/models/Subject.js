const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_urdu: {
    type: DataTypes.STRING,
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📚',
    comment: 'Emoji or icon identifier',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#64748b',
    comment: 'Hex color for UI display',
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
  tableName: 'subjects',
});

module.exports = Subject;
