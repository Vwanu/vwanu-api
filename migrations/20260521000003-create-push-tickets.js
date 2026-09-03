'use strict';

async function deviceTokensTableExists(queryInterface, transaction) {
  const [rows] = await queryInterface.sequelize.query(
    "SELECT to_regclass('device_tokens') AS relation;",
    { transaction },
  );

  return Boolean(rows[0]?.relation);
}

async function pushTicketsTableExists(queryInterface, transaction) {
  const [rows] = await queryInterface.sequelize.query(
    "SELECT to_regclass('push_tickets') AS relation;",
    { transaction },
  );

  return Boolean(rows[0]?.relation);
}

async function createDeviceTokensTable(queryInterface, Sequelize, transaction) {
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

  await queryInterface.addIndex('device_tokens', ['token'], {
    name: 'idx_device_tokens_token',
    unique: true,
    transaction,
  });

  await queryInterface.addIndex('device_tokens', ['user_id'], {
    name: 'idx_device_tokens_user_id',
    transaction,
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Wrapped in a transaction: sequelize-cli does not do this for us, and
    // Postgres DDL is transactional, so a failure part-way (e.g. a missing
    // FK target) rolls back cleanly instead of leaving the enum type behind
    // and wedging every retry. The enum itself is created by createTable,
    // which emits it guarded with EXCEPTION WHEN duplicate_object.
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (!(await deviceTokensTableExists(queryInterface, transaction))) {
        await createDeviceTokensTable(queryInterface, Sequelize, transaction);
      }

      if (await pushTicketsTableExists(queryInterface, transaction)) {
        return;
      }

      await queryInterface.createTable(
        'push_tickets',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
          },
          ticket_id: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          device_token_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'device_tokens', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          notification_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'notifications', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          sent_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          status: {
            type: Sequelize.ENUM('queued', 'ok', 'error'),
            allowNull: false,
            defaultValue: 'queued',
          },
          error_code: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE INDEX idx_push_tickets_status_sent
        ON push_tickets (status, sent_at)
        WHERE status = 'queued';
      `,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('push_tickets', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_push_tickets_status;',
        { transaction },
      );
    });
  },
};
