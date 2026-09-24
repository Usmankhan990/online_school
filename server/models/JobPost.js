const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobPost = sequelize.define('JobPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'stem',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'Part-Time / Full-Time',
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: 'Remote (100% Online)',
  },
  qualification: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  experience: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  skills: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('skills');
      if (!rawValue) return [];
      try {
        if (Array.isArray(rawValue)) return rawValue;
        return JSON.parse(rawValue);
      } catch (e) {
        if (typeof rawValue === 'string') {
          return rawValue.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('skills', JSON.stringify(value));
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            this.setDataValue('skills', JSON.stringify(parsed));
            return;
          }
        } catch (_) {}
        const items = value.split(',').map(s => s.trim()).filter(Boolean);
        this.setDataValue('skills', JSON.stringify(items));
      } else {
        this.setDataValue('skills', '[]');
      }
    },
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'job_posts',
  timestamps: true,
  underscored: true,
});

module.exports = JobPost;
