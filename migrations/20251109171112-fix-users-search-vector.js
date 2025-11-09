module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Change column type from STRING to TSVECTOR
    await queryInterface.changeColumn('users', 'search_vector', {
      type: 'TSVECTOR',
      allowNull: true,
    });

    // 2. Populate search_vector for all existing users
    await queryInterface.sequelize.query(`
      UPDATE users
      SET search_vector = (
        setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(email, '')), 'B')
      )
      WHERE search_vector IS NULL OR search_vector = '';
    `);

    // 3. Create GIN index for fast full-text search
    await queryInterface.addIndex('users', ['search_vector'], {
      name: 'users_search_vector_idx',
      using: 'GIN',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_search_vector_idx');
    await queryInterface.changeColumn('users', 'search_vector', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
