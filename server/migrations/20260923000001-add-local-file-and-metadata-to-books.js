'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('books');

      if (!tableInfo.local_file) {
        await queryInterface.addColumn('books', 'local_file', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Local uploaded PDF file path',
        });
      }

      if (!tableInfo.original_filename) {
        await queryInterface.addColumn('books', 'original_filename', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Original name of uploaded file',
        });
      }

      if (!tableInfo.mime_type) {
        await queryInterface.addColumn('books', 'mime_type', {
          type: Sequelize.STRING,
          defaultValue: 'application/pdf',
          allowNull: true,
        });
      }

      if (!tableInfo.file_size) {
        await queryInterface.addColumn('books', 'file_size', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'File size in bytes',
        });
      }

      if (!tableInfo.source_type) {
        await queryInterface.addColumn('books', 'source_type', {
          type: Sequelize.STRING,
          defaultValue: 'external',
          allowNull: true,
          comment: 'local, external, or both',
        });
      }

      if (!tableInfo.uploaded_by) {
        await queryInterface.addColumn('books', 'uploaded_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'User ID of uploader',
        });
      }

      if (!tableInfo.title_urdu) {
        await queryInterface.addColumn('books', 'title_urdu', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }

      if (!tableInfo.year) {
        await queryInterface.addColumn('books', 'year', {
          type: Sequelize.INTEGER,
          defaultValue: 2026,
          allowNull: true,
        });
      }
    } catch (err) {
      console.error('Migration 20260923000001 up error:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('books');
      if (tableInfo.local_file) await queryInterface.removeColumn('books', 'local_file');
      if (tableInfo.original_filename) await queryInterface.removeColumn('books', 'original_filename');
      if (tableInfo.mime_type) await queryInterface.removeColumn('books', 'mime_type');
      if (tableInfo.file_size) await queryInterface.removeColumn('books', 'file_size');
      if (tableInfo.source_type) await queryInterface.removeColumn('books', 'source_type');
      if (tableInfo.uploaded_by) await queryInterface.removeColumn('books', 'uploaded_by');
      if (tableInfo.title_urdu) await queryInterface.removeColumn('books', 'title_urdu');
      if (tableInfo.year) await queryInterface.removeColumn('books', 'year');
    } catch (err) {
      console.error('Migration 20260923000001 down error:', err.message);
    }
  }
};
