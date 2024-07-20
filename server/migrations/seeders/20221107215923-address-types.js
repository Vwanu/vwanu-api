/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { v4 } = require('uuid');

const addressTypes = [
  { name: 'Work', description: 'some description' },
  { name: 'Home', description: 'some description' },
  { name: 'Billing', description: 'some description' },
  { name: 'Shipping', description: 'some description' },
  { name: 'School', description: 'some description' },
  { name: 'Other', description: 'some description' },
];

const upsertAddressTypeQuery = fs.readFileSync(
  path.resolve(__dirname, '../queries', 'upsertAddressType.sql'),
  'utf-8'
);
module.exports = {
  async up(queryInterface) {
    // await queryInterface.bulkDelete('AddressTypes', null, {});
    await Promise.all(
      addressTypes.map(({ name, description }) =>
        queryInterface.sequelize.query(upsertAddressTypeQuery, {
          replacements: [v4(), name, description],
          type: QueryTypes.SELECT,
        })
      )
    );
    // return queryInterface.bulkInsert('AddressTypes', addressTypes);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('AddressTypes', null, {});
  },
};
