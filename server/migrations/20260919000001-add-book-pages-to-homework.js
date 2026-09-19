'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('classwork_homework');
      if (!tableInfo.book_pages) {
        await queryInterface.addColumn('classwork_homework', 'book_pages', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Mentioned book pages for the assignment (e.g. Page 12-15)',
        });
      }
      if (!tableInfo.page_images) {
        await queryInterface.addColumn('classwork_homework', 'page_images', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'JSON array of uploaded page image filenames',
        });
      }
    } catch (err) {
      console.error('Migration 20260919000001 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('classwork_homework');
      if (tableInfo.book_pages) {
        await queryInterface.removeColumn('classwork_homework', 'book_pages');
      }
      if (tableInfo.page_images) {
        await queryInterface.removeColumn('classwork_homework', 'page_images');
      }
    } catch (err) {
      console.error('Migration 20260919000001 down error:', err.message);
    }
  }
};
