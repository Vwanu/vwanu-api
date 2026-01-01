module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the friends table as it's been replaced by friendships
    await queryInterface.dropTable('friends');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the friends table for rollback purposes
    await queryInterface.createTable('friends', {
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      friend_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
};
