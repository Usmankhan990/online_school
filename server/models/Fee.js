const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., 2026-04',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'waived'),
    defaultValue: 'pending',
  },
  paid_date: {
    type: DataTypes.DATEONLY,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'jazzcash', 'easypaisa', 'bank_transfer', 'other'),
  },
  transaction_id: {
    type: DataTypes.STRING,
  },
  payment_proof: {
    type: DataTypes.STRING,
    comment: 'Path to payment proof screenshot',
  },
  verified_by: {
    type: DataTypes.INTEGER,
    comment: 'Admin user ID who verified the payment',
  },
  verification_date: {
    type: DataTypes.DATE,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'fees',
});

module.exports = Fee;
