module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blog_interests', {
      blog_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'blogs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      interest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'interests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('blog_interests', ['blog_id'], {
      name: 'blog_interests_blog_id_idx',
    });

    await queryInterface.addIndex('blog_interests', ['interest_id'], {
      name: 'blog_interests_interest_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('blog_interests');
  },
};
