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
    // Wrapped in a transaction: sequelize-cli does not do this for us, and
    // Postgres DDL is transactional, so a failure part-way rolls back
    // cleanly instead of leaving the enum type behind and wedging every
    // retry. The platform enum (matching Expo's getExpoPushTokenAsync
    // platforms) is created by createTable, which emits it guarded with
    // EXCEPTION WHEN duplicate_object.
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'device_tokens',
        {
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
        },
        { transaction },
      );

      // Critical: UNIQUE on `token` ALONE (not (user_id, token)).
      // One device = one owner at a time. Re-registration from a different
      // user is an UPDATE on user_id, which closes the shared-device
      // privacy hole at signin time.
      await queryInterface.addIndex('device_tokens', ['token'], {
        name: 'idx_device_tokens_token',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('device_tokens', ['user_id'], {
        name: 'idx_device_tokens_user_id',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('device_tokens', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_device_tokens_platform;',
        { transaction },
      );
    });
  },
};
