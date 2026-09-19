'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      
      if (!tableInfo.city) {
        await queryInterface.addColumn('teacher_profiles', 'city', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Teacher city of residence',
        });
      }

      if (!tableInfo.cnic_file) {
        await queryInterface.addColumn('teacher_profiles', 'cnic_file', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Uploaded CNIC document/photo filename',
        });
      }
    } catch (err) {
      console.error('Migration 20260919000004 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      if (tableInfo.city) await queryInterface.removeColumn('teacher_profiles', 'city');
      if (tableInfo.cnic_file) await queryInterface.removeColumn('teacher_profiles', 'cnic_file');
    } catch (err) {
      console.error('Migration 20260919000004 down error:', err.message);
    }
  }
};
