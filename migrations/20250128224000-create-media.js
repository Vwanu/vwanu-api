module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medias', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      original: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Original uploaded file URL/path',
      },
      large: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Large size version of the media file',
      },
      medium: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Medium size version of the media file',
      },
      small: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Small size version of the media file',
      },
      tiny: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tiny/thumbnail version of the media file',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the user who uploaded the media',
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

    // Add indexes for better performance
    await queryInterface.addIndex('medias', ['user_id'], {
      name: 'media_user_id_idx',
    });

    await queryInterface.addIndex('medias', ['created_at'], {
      name: 'media_created_at_idx',
    });

    // Index for finding recent user uploads
    await queryInterface.addIndex('medias', ['user_id', 'created_at'], {
      name: 'media_user_recent_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    try {
      await queryInterface.removeIndex('medias', 'media_user_id_idx');
      await queryInterface.removeIndex('medias', 'media_created_at_idx');
      await queryInterface.removeIndex('medias', 'media_user_recent_idx');
    } catch (error) {
      console.log('Some indexes may not exist, continuing with table drop...');
    }

    // Drop table
    await queryInterface.dropTable('medias');
  },
};
