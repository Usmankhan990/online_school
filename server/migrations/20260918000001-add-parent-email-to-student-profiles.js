'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('student_profiles');
      if (!tableInfo.parent_email) {
        await queryInterface.addColumn('student_profiles', 'parent_email', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Parent email address for notifications and account linking',
        });
      }
    } catch (err) {
      console.error('Migration 20260918000001 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('student_profiles');
      if (tableInfo.parent_email) {
        await queryInterface.removeColumn('student_profiles', 'parent_email');
      }
    } catch (err) {
      console.error('Migration 20260918000001 down error:', err.message);
    }
  }
};
