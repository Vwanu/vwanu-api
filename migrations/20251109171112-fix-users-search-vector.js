module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Change column type from STRING to TSVECTOR with explicit conversion
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN search_vector
      TYPE tsvector
      USING CASE
        WHEN search_vector IS NULL OR search_vector = '' THEN NULL
        ELSE to_tsvector('english', search_vector)
      END;
    `);

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
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN search_vector
      TYPE VARCHAR(255)
      USING search_vector::text;
    `);
  },
};
