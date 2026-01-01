module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('friendships', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      target_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0 = pending, 1 = accepted, 2 = denied',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add CHECK constraint to prevent self-friendship
    await queryInterface.sequelize.query(`
      ALTER TABLE friendships
      ADD CONSTRAINT chk_friendships_not_self
      CHECK (user_id != target_id);
    `);

    // Add indexes for performance
    await queryInterface.addIndex('friendships', ['user_id'], {
      name: 'idx_friendships_user_id',
    });
    await queryInterface.addIndex('friendships', ['target_id'], {
      name: 'idx_friendships_target_id',
    });
    await queryInterface.addIndex('friendships', ['status'], {
      name: 'idx_friendships_status',
    });

    // Add unique constraint to prevent bidirectional duplicates
    // This creates a canonical representation: LEAST(A,B) + GREATEST(A,B)
    // So both (A,B) and (B,A) map to the same unique constraint
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_friendships_unique_pair
      ON friendships (LEAST(user_id, target_id), GREATEST(user_id, target_id));
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('friendships');
  },
};
