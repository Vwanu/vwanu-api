'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Wrapped in a transaction: sequelize-cli does not do this for us, and
    // Postgres DDL is transactional, so a failure part-way (e.g. a missing
    // FK target) rolls back cleanly instead of leaving the enum type behind
    // and wedging every retry. The enum itself is created by createTable,
    // which emits it guarded with EXCEPTION WHEN duplicate_object.
    await queryInterface.sequelize.transaction(async (transaction) => {
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
