'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      
      if (!tableInfo.cv_file) {
        await queryInterface.addColumn('teacher_profiles', 'cv_file', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Teacher CV file path',
        });
      }

      if (!tableInfo.degree_files) {
        await queryInterface.addColumn('teacher_profiles', 'degree_files', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Teacher degree/certificate file paths (JSON or comma separated)',
        });
      }
    } catch (err) {
      console.error('Migration 20260923000002 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      if (tableInfo.cv_file) await queryInterface.removeColumn('teacher_profiles', 'cv_file');
      if (tableInfo.degree_files) await queryInterface.removeColumn('teacher_profiles', 'degree_files');
    } catch (err) {
      console.error('Migration 20260923000002 down error:', err.message);
    }
  }
};
