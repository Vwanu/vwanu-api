'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the trigger first
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS tr_add_user_notification ON "Users";',
    );

    // Drop the function
    await queryInterface.sequelize.query(
      'DROP FUNCTION IF EXISTS fn_add_user_notification();',
    );
  },

  async down(queryInterface, Sequelize) {
    // No need to recreate in down migration since we're removing it
  },
};
