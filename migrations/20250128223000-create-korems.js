module.exports = {
  async up(queryInterface, Sequelize) {
    // Create entity_type enum if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE entity_type AS ENUM ('Post', 'Blog', 'Discussion');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('korems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID of the entity being liked/reacted to (polymorphic)',
      },
      entity_type: {
        type: 'entity_type',
        allowNull: false,
        defaultValue: 'Post',
        comment: 'Type of entity being liked/reacted to (polymorphic)',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID of the user who created the like/reaction',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('korems', ['user_id'], {
      name: 'korems_user_id_idx',
    });

    await queryInterface.addIndex('korems', ['entity_id'], {
      name: 'korems_entity_id_idx',
    });

    await queryInterface.addIndex('korems', ['entity_type'], {
      name: 'korems_entity_type_idx',
    });

    // Composite index for finding likes on specific entities
    await queryInterface.addIndex('korems', ['entity_id', 'entity_type'], {
      name: 'korems_entity_idx',
    });

    // Composite index for finding user's likes on specific entity type
    await queryInterface.addIndex('korems', ['user_id', 'entity_type'], {
      name: 'korems_user_entity_type_idx',
    });

    // Unique constraint to prevent duplicate likes from same user on same entity
    await queryInterface.addIndex('korems', ['user_id', 'entity_id', 'entity_type'], {
      name: 'korems_unique_user_entity',
      unique: true,
    });

    // Index for recent activity queries
    await queryInterface.addIndex('korems', ['created_at'], {
      name: 'korems_created_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    try {
      await queryInterface.removeIndex('korems', 'korems_user_id_idx');
      await queryInterface.removeIndex('korems', 'korems_entity_id_idx');
      await queryInterface.removeIndex('korems', 'korems_entity_type_idx');
      await queryInterface.removeIndex('korems', 'korems_entity_idx');
      await queryInterface.removeIndex('korems', 'korems_user_entity_type_idx');
      await queryInterface.removeIndex('korems', 'korems_unique_user_entity');
      await queryInterface.removeIndex('korems', 'korems_created_at_idx');
    } catch (error) {
      console.log('Some indexes may not exist, continuing with table drop...');
    }

    // Drop table
    await queryInterface.dropTable('korems');

    // Note: We don't drop the entity_type enum as it might be used by other tables
    // If you want to drop it, uncomment the following line:
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS entity_type CASCADE;');
  },
};
