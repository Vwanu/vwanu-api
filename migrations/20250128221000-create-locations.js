module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'The name/description of the location',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('locations', ['name'], {
      name: 'locations_name_idx',
    });

    // Add unique constraint on name to prevent duplicate locations
    await queryInterface.addIndex('locations', ['name'], {
      name: 'locations_name_unique',
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    try {
      await queryInterface.removeIndex('locations', 'locations_name_idx');
      await queryInterface.removeIndex('locations', 'locations_name_unique');
    } catch (error) {
      console.log('Some indexes may not exist, continuing with table drop...');
    }

    // Drop table
    await queryInterface.dropTable('locations');
  },
};
