module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('blogs', ['published_at'], {
      name: 'blogs_published_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('blogs', 'blogs_published_at_idx');
  },
};
