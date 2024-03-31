module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notification_name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      notification_description: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('notification_settings');
  },
};
