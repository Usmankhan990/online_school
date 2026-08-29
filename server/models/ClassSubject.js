const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassSubject = sequelize.define('ClassSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'class_subjects',
});

module.exports = ClassSubject;
