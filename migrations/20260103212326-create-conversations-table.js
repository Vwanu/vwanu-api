module.exports = {
  async up(queryInterface, Sequelize) {
    // Create conversation type ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_conversations_type AS ENUM ('direct', 'group');
    `);

    // Create conversations table
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      amount_of_people: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
        allowNull: false,
      },
      amount_of_unread_messages: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('direct', 'group'),
        defaultValue: 'direct',
        allowNull: false,
      },
      group_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('conversations', ['type']);
  },

  async down(queryInterface, Sequelize) {
    // Drop table
    await queryInterface.dropTable('conversations');

    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_conversations_type;
    `);
  },
};
