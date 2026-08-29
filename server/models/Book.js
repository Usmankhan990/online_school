const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title_urdu: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  publisher: {
    type: DataTypes.STRING,
    defaultValue: 'PCTB Punjab',
  },
  year: {
    type: DataTypes.INTEGER,
    defaultValue: 2026,
  },
  medium: {
    type: DataTypes.ENUM('English', 'Urdu', 'Both'),
    defaultValue: 'Both',
  },
  pdf_url: {
    type: DataTypes.STRING,
    comment: 'External link to PDF (e.g. Ustad360)',
  },
  local_file: {
    type: DataTypes.STRING,
    comment: 'Local uploaded PDF file path (e.g. /uploads/books/file.pdf)',
  },
  original_filename: {
    type: DataTypes.STRING,
    comment: 'Original name of uploaded file',
  },
  mime_type: {
    type: DataTypes.STRING,
    defaultValue: 'application/pdf',
  },
  file_size: {
    type: DataTypes.INTEGER,
    comment: 'File size in bytes',
  },
  cover_image: {
    type: DataTypes.STRING,
  },
  source_type: {
    type: DataTypes.STRING,
    defaultValue: 'external',
    comment: 'local, external, or both',
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    comment: 'User ID of uploader',
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'books',
});

module.exports = Book;
