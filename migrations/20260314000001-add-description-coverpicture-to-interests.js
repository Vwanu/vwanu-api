module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('interests', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('interests', 'cover_picture', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('interests', 'description');
    await queryInterface.removeColumn('interests', 'cover_picture');
  },
};
