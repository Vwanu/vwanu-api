module.exports = {
  async up(queryInterface, Sequelize) {
    // Add location_id column to users table
    await queryInterface.addColumn('users', 'location_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID of the location associated with the user (optional)',
    });

    // Add index for better performance when querying users by location
    await queryInterface.addIndex('users', ['location_id'], {
      name: 'users_location_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop index first
    try {
      await queryInterface.removeIndex('users', 'users_location_id_idx');
    } catch (error) {
      console.log('Index may not exist, continuing with column drop...');
    }

    // Remove the location_id column
    await queryInterface.removeColumn('users', 'location_id');
  },
};
