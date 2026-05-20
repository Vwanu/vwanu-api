'use strict';

const seeds = require('./data/notification_types_v2');

/**
 * VWA-140 step 2/3: replace the `notification_types` lookup table with the
 * new schema (id SERIAL PK instead of slug TEXT PK; new `label` column
 * instead of `notification_name` + `notification_description` with the buggy
 * UNIQUE-on-description constraint).
 *
 * Then create `user_notification_preference` (the new per-user, per-type
 * table) with the CHECK constraint enforcing `push=true → in_app=true`, and
 * backfill rows for every existing user × every notification type using
 * DEFAULT_PREFERENCES.
 *
 * Migration 3 (separate file) handles the `notifications` column changes.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop the old notification_types table (slug-PK shape).
    //    Its only FK consumer (user_notification_types) is gone after
    //    migration 1.
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS notification_types CASCADE;'
    );

    // 2. Create the new notification_types with SERIAL id PK.
    await queryInterface.createTable('notification_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });

    // 3. Seed the lookup table.
    await queryInterface.bulkInsert(
      'notification_types',
      seeds.map((s) => ({
        slug: s.slug,
        label: s.label,
        description: s.description,
      }))
    );

    // 4. Create user_notification_preference with the CHECK constraint.
    await queryInterface.createTable('user_notification_preference', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      notification_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'notification_types', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      in_app: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      push: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    // CHECK constraint: push=true requires in_app=true.
    // Sequelize's createTable doesn't directly support CHECK on table level
    // for composite columns, so we add it via raw SQL.
    await queryInterface.sequelize.query(`
      ALTER TABLE user_notification_preference
      ADD CONSTRAINT user_notification_preference_push_requires_in_app
      CHECK (NOT push OR in_app);
    `);

    // Helpful index for lookups by user (which happens on every settings
    // load and every notification emit).
    await queryInterface.addIndex('user_notification_preference', ['user_id'], {
      name: 'idx_user_notification_preference_user_id',
    });

    // 5. Backfill: every user × every type, using DEFAULT_PREFERENCES per slug.
    //    Built as a single INSERT ... SELECT for speed.
    const defaults = seeds.DEFAULT_PREFERENCES;
    const valueRows = seeds
      .map((s) => {
        const d = defaults[s.slug];
        return `('${s.slug}', ${d.in_app}, ${d.push})`;
      })
      .join(',\n        ');

    await queryInterface.sequelize.query(`
      WITH slug_defaults(slug, in_app, push) AS (
        VALUES
        ${valueRows}
      )
      INSERT INTO user_notification_preference (user_id, notification_type_id, in_app, push)
      SELECT u.id, nt.id, sd.in_app, sd.push
      FROM users u
      CROSS JOIN notification_types nt
      JOIN slug_defaults sd ON sd.slug = nt.slug
      ON CONFLICT DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS user_notification_preference CASCADE;'
    );
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS notification_types CASCADE;'
    );
    // Note: we do NOT recreate the old slug-PK notification_types shape in
    // the down migration. If the rollback ever needs the old schema back,
    // restore from backup. The old shape was buggy (UNIQUE-on-description)
    // and we don't want to revive it.
  },
};
