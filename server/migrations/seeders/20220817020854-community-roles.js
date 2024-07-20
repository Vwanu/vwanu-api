/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
// const { v4 } = require('uuid');

const roles = [
  { name: 'admin', role_access_level: 0 },
  { name: 'moderator', role_access_level: 1 },
  { role_access_level: 2, name: 'member' },
];
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
    return queryInterface.bulkInsert(
      'roles',
      roles.map(({ name, role_access_level }) => ({
        name,
        role_access_level,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('roles', null, {});
  },
};
