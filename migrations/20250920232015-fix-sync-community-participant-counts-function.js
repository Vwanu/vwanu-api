'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const query = fs.readFileSync(
      path.resolve(__dirname, './queries', 'fn_sync_community_participant_counts.sql'),
      'utf8'
    );
    
    await queryInterface.sequelize.query(query);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'DROP FUNCTION IF EXISTS fn_sync_community_participant_counts'
    );
  }
};
