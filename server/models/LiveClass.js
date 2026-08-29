const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
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
  meeting_url: {
    type: DataTypes.STRING,
    comment: 'Zoom/Meet link',
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 45,
  },
  recording_url: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
}, {
  tableName: 'live_classes',
});

module.exports = LiveClass;
