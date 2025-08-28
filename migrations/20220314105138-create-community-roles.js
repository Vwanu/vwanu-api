module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('community_roles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },

      name: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      role_access_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('CommunityRoles');
  },
};
