'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('community_join_requests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      guest_id: {
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
        defaultValue: null,
      },

      approver_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: true,
      },
      is_auto_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      community_role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'community_roles',
          key: 'id',
        },
        allowNull: false,
      },
      community_id: {
        type: Sequelize.UUID,
        references: {
          model: 'communities',
          key: 'id',
        },
        allowNull: false,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add unique constraint: a user can only request to join a community once
    await queryInterface.addConstraint('community_join_requests', {
      fields: ['guest_id', 'community_id'],
      type: 'unique',
      name: 'unique_guest_community_join_request',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('community_join_requests');
  },
};
