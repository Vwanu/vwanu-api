module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_medias', {
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        field: 'post_id',
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the post',
      },
      media_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'medium_id',
        references: {
          model: 'medias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the media file',
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('post_medias', ['post_id'], {
      name: 'post_media_post_id_idx',
    });

    await queryInterface.addIndex('post_medias', ['medium_id'], {
      name: 'post_media_medium_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    try {
      await queryInterface.removeIndex('post_medias', 'post_media_post_id_idx');
      await queryInterface.removeIndex('post_medias', 'post_media_medium_id_idx');
    } catch (error) {
      console.log('Some indexes may not exist, continuing with table drop...');
    }

    // Drop table
    await queryInterface.dropTable('post_medias');
  },
};
