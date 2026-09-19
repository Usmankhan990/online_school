'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      
      if (!tableInfo.address) {
        await queryInterface.addColumn('teacher_profiles', 'address', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Teacher address as per CNIC',
        });
      }
    } catch (err) {
      console.error('Migration 20260919000005 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      if (tableInfo.address) await queryInterface.removeColumn('teacher_profiles', 'address');
    } catch (err) {
      console.error('Migration 20260919000005 down error:', err.message);
    }
  }
};
