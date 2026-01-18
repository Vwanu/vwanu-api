module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'visit' to the notification_type ENUM type
    // PostgreSQL requires using raw SQL to add a value to an existing ENUM
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Check if 'visit' value already exists in the enum
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_notifications_notification_type'
          AND e.enumlabel = 'visit'
        ) THEN
          -- Add 'visit' to the enum
          ALTER TYPE "enum_notifications_notification_type" ADD VALUE 'visit';
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL does not support removing values from ENUMs directly.
    // To rollback, you would need to:
    // 1. Create a new ENUM type without 'visit'
    // 2. Alter the column to use the new type (with USING clause to convert values)
    // 3. Drop the old type
    // 4. Rename the new type to the old name
    //
    // This is complex and risky, so we don't implement automatic rollback.
    // If you need to rollback, ensure no data uses notificationType='visit' first,
    // then manually run the following SQL:

    console.log('WARNING: Rollback not implemented for ENUM value removal.');
    console.log('To manually rollback, ensure no notifications use notificationType="visit", then run:');
    console.log(`
      -- Create temporary enum without 'visit'
      CREATE TYPE enum_notifications_notification_type_new AS ENUM (
        'community_invite', 'community_join', 'community_post', 'community_mention',
        'friend_request', 'friend_accept', 'follow',
        'post_like', 'post_comment', 'blog_like', 'blog_comment',
        'system_update', 'security_alert'
      );

      -- Update the column to use new type
      ALTER TABLE notifications
        ALTER COLUMN notification_type TYPE enum_notifications_notification_type_new
        USING notification_type::text::enum_notifications_notification_type_new;

      -- Drop old type and rename new one
      DROP TYPE enum_notifications_notification_type;
      ALTER TYPE enum_notifications_notification_type_new RENAME TO enum_notifications_notification_type;
    `);
  },
};
