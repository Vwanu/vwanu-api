'use strict';

/**
 * VWA-139: device_tokens table for Expo push token storage.
 *
 * One row = one device. UNIQUE(token) intentionally — Expo push tokens
 * are device-bound, not user-bound. When User A signs out and User B
 * signs in on the same device, the POST /device-tokens endpoint
 * UPDATEs the row's user_id to reassign ownership (signin handoff).
 * See VWA-139 ticket for the full shared-device privacy reasoning.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Platform ENUM (matches Expo's getExpoPushTokenAsync platforms)
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_device_tokens_platform AS ENUM ('ios', 'android');
    `);

    await queryInterface.createTable('device_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      platform: {
        type: Sequelize.ENUM('ios', 'android'),
        allowNull: false,
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Critical: UNIQUE on `token` ALONE (not (user_id, token)).
    // One device = one owner at a time. Re-registration from a different
    // user is an UPDATE on user_id, which closes the shared-device
    // privacy hole at signin time.
    await queryInterface.addIndex('device_tokens', ['token'], {
      name: 'idx_device_tokens_token',
      unique: true,
    });

    await queryInterface.addIndex('device_tokens', ['user_id'], {
      name: 'idx_device_tokens_user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_tokens');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_device_tokens_platform;',
    );
  },
};
