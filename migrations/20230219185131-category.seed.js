// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require('fs');
const path = require('path');
const { v4 } = require('uuid');
const { QueryTypes } = require('sequelize');
const categoriesWithInterest = require('./data/cats');

const upsertForumCategoryQuery = `INSERT INTO "forums"
("id","name","description","cover_picture","created_at","updated_at")
   VALUES (?, ?, ?,?, current_timestamp, current_timestamp)
  ON CONFLICT("name") DO NOTHING;`

const upsertInterestQuery = `INSERT INTO "interests" 
("id","name","created_at","updated_at")
  VALUES (?, ?, current_timestamp, current_timestamp)
  ON CONFLICT("name") DO NOTHING RETURNING id;`
  
const findOrSaveInterest = async (name, queryInterface) => {
  await queryInterface.sequelize.query(upsertInterestQuery, {
    replacements: [v4(), name],
    type: QueryTypes.SELECT,
  });
};

module.exports = {
  async up(queryInterface) {
    // Cleaning the table
    // await queryInterface.bulkDelete('ForumCategories', null, {});
    await Promise.all(
      categoriesWithInterest.map((category) =>
        queryInterface.sequelize.query(upsertForumCategoryQuery, {
          replacements: [
            v4(),
            category.name,
            category.description,
            category.coverPicture,
          ],
          type: QueryTypes.INSERT,
        })
      )
    );
    await Promise.all(
      categoriesWithInterest.map((category) =>
        findOrSaveInterest(category.name, queryInterface)
      )
    );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('forums', null, {});
  },
};
