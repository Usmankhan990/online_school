const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ParentProfile = sequelize.define('ParentProfile', {
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
  relation: {
    type: DataTypes.ENUM('Father', 'Mother', 'Guardian'),
    defaultValue: 'Father',
  },
  cnic: {
    type: DataTypes.STRING(15),
  },
  occupation: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'parent_profiles',
});

module.exports = ParentProfile;
