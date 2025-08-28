module.exports = {
  async up(queryInterface, Sequelize) {
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
        // @ts-ignore
        level: 'C',
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        // @ts-ignore
        level: 'A',
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable('forums');
  },
};
