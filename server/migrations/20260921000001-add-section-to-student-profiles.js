'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('student_profiles');
      if (!tableInfo.section) {
        await queryInterface.addColumn('student_profiles', 'section', {
          type: Sequelize.STRING(10),
          allowNull: true,
          defaultValue: 'A',
          comment: 'Student class section (A, B, C, D...)',
        });
      }
    } catch (err) {
      console.error('Migration 20260921000001 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('student_profiles');
      if (tableInfo.section) {
        await queryInterface.removeColumn('student_profiles', 'section');
      }
    } catch (err) {
      console.error('Migration 20260921000001 down error:', err.message);
    }
  }
};
