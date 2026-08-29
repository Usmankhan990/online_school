const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
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
  type: {
    type: DataTypes.ENUM('leaving_certificate', 'birth_certificate', 'cnic_copy', 'photo', 'result_card', 'other'),
    defaultValue: 'other',
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
  },
  mime_type: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'documents',
});

module.exports = Document;
