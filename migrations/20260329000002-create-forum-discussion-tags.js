'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forum_discussion_tags', {
      forum_discussion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'forum_discussions',
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
    });

    await queryInterface.addIndex('forum_discussion_tags', ['forum_discussion_id', 'user_id']);
    await queryInterface.addIndex('forum_discussion_tags', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_discussion_tags');
  },
};
