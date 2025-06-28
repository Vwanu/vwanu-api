'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No need to create trigger since we're removing it
  },

  async down(queryInterface, Sequelize) {
    // No need to drop trigger since we're removing it
  },
};
