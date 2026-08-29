const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassworkHomework = sequelize.define('ClassworkHomework', {
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
  type: {
    type: DataTypes.ENUM('classwork', 'homework'),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
  },
  due_date: {
    type: DataTypes.DATE,
  },
  total_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'classwork_homework',
});

module.exports = ClassworkHomework;
