module.exports = {
  async up(queryInterface, Sequelize) {
    // Create privacy_type enum if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE privacy_type AS ENUM ('public', 'private', 'hidden');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      post_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'The main content/text of the post',
      },
      privacy_type: {
        type: 'privacy_type',
        allowNull: false,
        defaultValue: 'public',
        comment: 'Privacy level: public, private, or hidden',
      },
      locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the post is locked from interactions',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the user who created the post',
      },
      community_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'communities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID of the community this post belongs to (optional)',
      },
     post_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the parent post (for comments/replies)',
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
    await queryInterface.addIndex('posts', ['user_id'], {
      name: 'posts_user_id_idx',
    });

    await queryInterface.addIndex('posts', ['community_id'], {
      name: 'posts_community_id_idx',
    });

    await queryInterface.addIndex('posts', ['post_id'], {
      name: 'posts_parent_post_id_idx',
    });

    await queryInterface.addIndex('posts', ['privacy_type'], {
      name: 'posts_privacy_type_idx',
    });

    await queryInterface.addIndex('posts', ['created_at'], {
      name: 'posts_created_at_idx',
    });


    // Add index for public posts (most common query)
    await queryInterface.addIndex('posts', ['privacy_type', 'locked', 'created_at'], {
      name: 'posts_public_active_idx',
      where: {
        privacy_type: 'public',
        locked: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first (using IF EXISTS to avoid errors if they don't exist)
    try {
      await queryInterface.removeIndex('posts', 'posts_user_id_idx');
      await queryInterface.removeIndex('posts', 'posts_community_id_idx');
      await queryInterface.removeIndex('posts', 'posts_parent_post_id_idx');
      await queryInterface.removeIndex('posts', 'posts_privacy_type_idx');
      await queryInterface.removeIndex('posts', 'posts_created_at_idx');
      await queryInterface.removeIndex('posts', 'posts_user_community_idx');
      await queryInterface.removeIndex('posts', 'posts_public_active_idx');
    } catch (error) {
      console.log('Some indexes may not exist, continuing with table drop...');
    }

    // Drop table
    await queryInterface.dropTable('posts');

    // Note: We don't drop the privacy_type enum as it might be used by other tables
    // If you want to drop it, uncomment the following line:
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS privacy_type CASCADE;');
  },
};
