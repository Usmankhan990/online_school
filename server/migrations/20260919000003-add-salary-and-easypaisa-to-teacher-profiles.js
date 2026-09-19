'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      
      if (!tableInfo.easypaisa_number) {
        await queryInterface.addColumn('teacher_profiles', 'easypaisa_number', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Easypaisa account number for salary receive',
        });
      }

      if (!tableInfo.account_title) {
        await queryInterface.addColumn('teacher_profiles', 'account_title', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Account title / type for salary receive',
        });
      }

      if (!tableInfo.account_holder_name) {
        await queryInterface.addColumn('teacher_profiles', 'account_holder_name', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Account holder name for salary receive',
        });
      }

      if (!tableInfo.photo) {
        await queryInterface.addColumn('teacher_profiles', 'photo', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Passport size photo filename with white or blue background',
        });
      }
    } catch (err) {
      console.error('Migration 20260919000003 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teacher_profiles');
      if (tableInfo.easypaisa_number) await queryInterface.removeColumn('teacher_profiles', 'easypaisa_number');
      if (tableInfo.account_title) await queryInterface.removeColumn('teacher_profiles', 'account_title');
      if (tableInfo.account_holder_name) await queryInterface.removeColumn('teacher_profiles', 'account_holder_name');
      if (tableInfo.photo) await queryInterface.removeColumn('teacher_profiles', 'photo');
    } catch (err) {
      console.error('Migration 20260919000003 down error:', err.message);
    }
  }
};
