module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('communities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      }, 
      num_members: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      num_admins: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        // @ts-ignore
        level: 'A',
      },

      privacy_type: {
        type: Sequelize.ENUM('public', 'private', 'hidden'),
        defaultValue: 'public',
        allowNull: false,
        // @ts-ignore
        level: 'C',
      },
      cover_picture: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
        // @ts-ignore
        level: 'B',
      },
      profile_picture: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      can_invite: {
        type: Sequelize.STRING,
        defaultValue: 'E',
        allowNull: true,
      },

      can_post: {
        type: Sequelize.STRING,
        defaultValue: 'E',
        allowNull: true,
      },

      search_vector: {
        type: Sequelize.TSVECTOR,
        allowNull: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Communities');
  },
};
