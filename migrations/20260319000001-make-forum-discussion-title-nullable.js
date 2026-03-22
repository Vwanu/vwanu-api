module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('forum_discussions', 'title', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('forum_discussions', 'title', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
