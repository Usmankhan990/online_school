module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('attendance', 'class_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    } catch (err) {
      console.log('Migration note (class_id alter):', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('attendance', 'class_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    } catch (err) {
      console.log('Rollback note (class_id alter):', err.message);
    }
  }
};
