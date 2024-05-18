module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('template_messages', {
      snug: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      template_body: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      required_fields: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('template_messages');
  },
};
