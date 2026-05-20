'use strict';

const seeds = require('./data/notification_types_v2');

/**
 * VWA-140 step 3/3: migrate the `notifications` table off the old
 * `notification_type` ENUM column onto a `notification_type_id` FK, and
 * swap the boolean `view` column for `read_at TIMESTAMP NULL`.
 *
 * Strategy: add the new columns nullable, backfill from the old columns,
 * then enforce NOT NULL + FK and drop the old columns. This keeps the
 * migration safe to run on a live database where notifications may be
 * written concurrently — though in practice all notification creation runs
 * through the application, which is being updated as part of this PR.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add the new columns (nullable initially so we can backfill).
    await queryInterface.addColumn('notifications', 'notification_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'notification_types', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('notifications', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // 2. Backfill read_at from the old `view` column (read=true → read_at=NOW;
    //    read=false → read_at=NULL).
    await queryInterface.sequelize.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE view = true;
    `);

    // 3. Backfill notification_type_id from the legacy notification_type ENUM
    //    via the hard-coded mapping in data/notification_types_v2.js.
    const mapping = seeds.LEGACY_TYPE_TO_SLUG;
    const cases = Object.entries(mapping)
      .map(([legacy, slug]) => `WHEN '${legacy}' THEN (SELECT id FROM notification_types WHERE slug = '${slug}')`)
      .join('\n      ');

    await queryInterface.sequelize.query(`
      UPDATE notifications
      SET notification_type_id = CASE notification_type
      ${cases}
      END
      WHERE notification_type IS NOT NULL;
    `);

    // 4. Defensive: any row with NULL notification_type_id at this point had
    //    a notification_type value not in the mapping. Log via raw query
    //    (will show in migration output), then delete them — they're
    //    unmappable orphans from earlier schema experiments.
    const [orphans] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS n FROM notifications WHERE notification_type_id IS NULL;'
    );
    const orphanCount = parseInt(orphans[0].n, 10);
    if (orphanCount > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[VWA-140] Deleting ${orphanCount} notification rows with unmappable notification_type values.`
      );
      await queryInterface.sequelize.query(
        'DELETE FROM notifications WHERE notification_type_id IS NULL;'
      );
    }

    // 5. Enforce NOT NULL on the new FK column now that backfill is complete.
    await queryInterface.changeColumn('notifications', 'notification_type_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'notification_types', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // 6. Drop the old columns.
    await queryInterface.removeColumn('notifications', 'notification_type');
    await queryInterface.removeColumn('notifications', 'view');

    // 7. Drop the now-orphaned ENUM type that backed notification_type.
    //    Postgres preserves the enum even after dropping the column that
    //    used it, so we need to explicitly DROP TYPE.
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_notification_type";'
    );

    // 8. Drop the old indexes that referenced `view`.
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_notifications_user_id_view;'
    );

    // 9. Create the partial unread index. This makes both the unread-list
    //    query and the capped unread-count query near-constant-time
    //    regardless of how many read notifications exist.
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_notifications_user_unread
      ON notifications (user_id, created_at DESC)
      WHERE read_at IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the new index first.
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_notifications_user_unread;'
    );

    // Re-add the old columns nullable.
    await queryInterface.addColumn('notifications', 'view', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.sequelize.query(`
      UPDATE notifications SET view = (read_at IS NOT NULL);
    `);

    // Re-create the old ENUM and column (with the original values from
    // the create-notifications migration).
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_notifications_notification_type" AS ENUM (
        'community_invite', 'community_join', 'community_post', 'community_mention',
        'friend_request', 'friend_accept', 'follow', 'visit',
        'post_like', 'post_comment', 'blog_like', 'blog_comment',
        'system_update', 'security_alert'
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications
      ADD COLUMN notification_type "enum_notifications_notification_type";
    `);

    // Re-create the old user_id+view index.
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_notifications_user_id_view
      ON notifications (user_id, view);
    `);

    // Drop the new FK column.
    await queryInterface.removeColumn('notifications', 'notification_type_id');
    await queryInterface.removeColumn('notifications', 'read_at');
  },
};
