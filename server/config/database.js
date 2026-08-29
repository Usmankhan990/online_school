const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      define: { timestamps: true, underscored: true },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
      }
    })
  : new Sequelize({
      dialect: process.env.DB_DIALECT || 'sqlite',
      storage: process.env.DB_DIALECT === 'sqlite' || !process.env.DB_DIALECT
        ? path.resolve(__dirname, '..', process.env.DB_PATH || './database.sqlite')
        : null,
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

module.exports = sequelize;
