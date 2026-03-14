module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blog_medias', {
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
      medium_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'medias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('blog_medias', ['blog_id'], {
      name: 'blog_medias_blog_id_idx',
    });

    await queryInterface.addIndex('blog_medias', ['medium_id'], {
      name: 'blog_medias_medium_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('blog_medias');
  },
};
