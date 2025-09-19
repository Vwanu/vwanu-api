'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column already exists
      const tableDescription = await queryInterface.describeTable('users');
      
      if (!tableDescription.cover_picture) {
        await queryInterface.addColumn('users', 'cover_picture', {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
          comment: 'URL to user cover picture stored in S3 or other storage',
        });
        
        console.log('✅ Successfully added cover_picture column to users table');
      } else {
        console.log('⚠️ cover_picture column already exists in users table');
      }
    } catch (error) {
      console.error('❌ Error adding cover_picture column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('users');
      
      if (tableDescription.cover_picture) {
        await queryInterface.removeColumn('users', 'cover_picture');
        console.log('✅ Successfully removed cover_picture column from users table');
      } else {
        console.log('⚠️ cover_picture column does not exist in users table');
      }
    } catch (error) {
      console.error('❌ Error removing cover_picture column:', error);
      throw error;
    }
  }
};
