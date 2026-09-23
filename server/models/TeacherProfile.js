const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherProfile = sequelize.define('TeacherProfile', {
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
  qualification: {
    type: DataTypes.STRING,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  joining_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
  },
  easypaisa_number: {
    type: DataTypes.STRING,
  },
  account_title: {
    type: DataTypes.STRING,
  },
  account_holder_name: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  cnic_file: {
    type: DataTypes.STRING,
  },
  cv_file: {
    type: DataTypes.STRING,
  },
  degree_files: {
    type: DataTypes.TEXT,
  },
  address: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'teacher_profiles',
});

module.exports = TeacherProfile;
