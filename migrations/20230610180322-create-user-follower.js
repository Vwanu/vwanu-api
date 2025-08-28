module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('followers', {
      user_id: {
        type: Sequelize.UUID,
        foreignKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        primaryKey: true,
      },
      follower_id: {
        type: Sequelize.UUID,
        foreignKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        primaryKey: true,
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
  async down(queryInterface) {
    await queryInterface.dropTable('followers');
  },
};
