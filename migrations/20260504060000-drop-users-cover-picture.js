'use strict';

/**
 * VWA-137 — drop unused users.cover_picture column.
 *
 * No screen / feature consumes this column. Confirmed during VWA-127
 * (registration profile screen handles only profilePicture) and VWA-133
 * (mobile codebase has zero reads of users.coverPicture). Carrying it
 * was wasting a backfill in VWA-133 and adding noise to types/hooks.
 */

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('users', 'cover_picture');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'cover_picture', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    });
  },
};
