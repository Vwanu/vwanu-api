module.exports = {
  async up(queryInterface, Sequelize) {
    // Create conversation_users junction table
    await queryInterface.createTable('conversation_users', {
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'conversations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('conversation_users', ['conversation_id']);
    await queryInterface.addIndex('conversation_users', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop table
    await queryInterface.dropTable('conversation_users');
  },
};
