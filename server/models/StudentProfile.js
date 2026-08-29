const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentProfile = sequelize.define('StudentProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  father_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mother_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  father_cnic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'Format: 00000-0000000-0',
  },
  contact_number_1: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  contact_number_2: {
    type: DataTypes.STRING(15),
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medium: {
    type: DataTypes.ENUM('English', 'Urdu'),
    allowNull: false,
    defaultValue: 'English',
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
  },
  address: {
    type: DataTypes.TEXT,
  },
  admission_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  roll_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    comment: 'Link to parent user',
  },
}, {
  tableName: 'student_profiles',
});

module.exports = StudentProfile;
