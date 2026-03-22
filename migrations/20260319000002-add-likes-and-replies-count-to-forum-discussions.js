module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('forum_discussions', 'amount_of_likes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('forum_discussions', 'amount_of_replies', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('forum_discussions', 'amount_of_likes');
    await queryInterface.removeColumn('forum_discussions', 'amount_of_replies');
  },
};
