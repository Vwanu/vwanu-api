module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('community_invitation_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      guest_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },

      host_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },

      response: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      community_role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'community_roles',
          key: 'id',
        },
        allowNull: false,
      },

      community_id:{
        type: Sequelize.UUID,
        references: {
          model: 'communities',
          key: 'id',
        },
        allowNull: false,
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable('community_invitation_requests');
  },
};
