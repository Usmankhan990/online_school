const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
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
  teacher_id: {
    type: DataTypes.INTEGER,
  },
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    defaultValue: 'Online',
  },
}, {
  tableName: 'timetable',
});

module.exports = Timetable;
