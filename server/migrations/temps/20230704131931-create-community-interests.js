module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Community_Interest', {
      community_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Communities',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      interest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Interests',
          key: 'id',
        },
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('community_users');
  },
};
