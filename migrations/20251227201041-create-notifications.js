module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('notifications', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entity_name: {
        type: DataTypes.ENUM('Post', 'Blog', 'Discussion', 'Community', 'Comment', 'Message'),
        allowNull: true,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      notification_type: {
        type: DataTypes.ENUM(
          'community_invite', 'community_join', 'community_post', 'community_mention',
          'friend_request', 'friend_accept', 'follow',
          'post_like', 'post_comment', 'blog_like', 'blog_comment',
          'system_update', 'security_alert'
        ),
        allowNull: false,
      },
      view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      from_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('notifications', ['user_id', 'view'], {
      name: 'idx_notifications_user_id_view',
    });
    await queryInterface.addIndex('notifications', ['user_id', 'created_at'], {
      name: 'idx_notifications_user_id_created',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  },
};
