module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('community_invitation_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      guest: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: true,
      },

      host: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      response: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },

      response_date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('community_invitation_requests');
  },
};
