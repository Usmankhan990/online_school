const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'approval', 'result', 'fee', 'homework'),
    defaultValue: 'info',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  link: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'notifications',
});

module.exports = Notification;
