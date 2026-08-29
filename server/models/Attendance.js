const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_role: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
    defaultValue: 'student',
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
    allowNull: false,
    defaultValue: 'present',
  },
  marked_by: {
    type: DataTypes.INTEGER,
    comment: 'Teacher user ID',
  },
  selfie_path: {
    type: DataTypes.STRING,
    comment: 'Path to selfie photo used for verification',
  },
  verification_method: {
    type: DataTypes.ENUM('manual', 'selfie', 'auto'),
    defaultValue: 'manual',
    comment: 'How attendance was marked',
  },
  remarks: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'attendance',
});

module.exports = Attendance;
