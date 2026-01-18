'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column already exists
      const tableDescription = await queryInterface.describeTable('users');

      if (!tableDescription.online) {
        await queryInterface.addColumn('users', 'online', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Indicates if the user is currently online',
        });

        console.log('✅ Successfully added online column to users table');
      } else {
        console.log('⚠️ online column already exists in users table');
      }
    } catch (error) {
      console.error('❌ Error adding online column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('users');

      if (tableDescription.online) {
        await queryInterface.removeColumn('users', 'online');
        console.log('✅ Successfully removed online column from users table');
      } else {
        console.log('⚠️ online column does not exist in users table');
      }
    } catch (error) {
      console.error('❌ Error removing online column:', error);
      throw error;
    }
  }
};
