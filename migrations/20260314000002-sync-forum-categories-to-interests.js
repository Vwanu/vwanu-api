/**
 * Sync description and cover_picture from forums (forum_categories) to interests
 * where names match, then drop the forums table.
 */
module.exports = {
  async up(queryInterface) {
    // Step 1: Copy description and cover_picture from forums to matching interests
    await queryInterface.sequelize.query(`
      UPDATE interests
      SET
        description = f.description,
        cover_picture = f.cover_picture
      FROM forums f
      WHERE TRIM(interests.name) = TRIM(f.name)
        AND (interests.description IS NULL OR interests.cover_picture IS NULL);
    `);

    // Step 2: Drop the forums table
    await queryInterface.dropTable('forums');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the forums table
    await queryInterface.createTable('forums', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      cover_picture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      search_vector: {
        type: Sequelize.TSVECTOR,
        allowNull: true,
      },
    });

    // Copy data back from interests to forums
    await queryInterface.sequelize.query(`
      INSERT INTO forums (id, name, description, cover_picture, created_at, updated_at)
      SELECT gen_random_uuid(), name, description, cover_picture, NOW(), NOW()
      FROM interests
      WHERE description IS NOT NULL OR cover_picture IS NOT NULL;
    `);
  },
};
