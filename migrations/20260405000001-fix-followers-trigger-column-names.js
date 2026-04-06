module.exports = {
  async up(queryInterface) {
    // Drop the old trigger and function that reference incorrect column names
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS tr_increment_follower_counts ON "followers";
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS fn_update_followers_counts();
    `);

    // Recreate with correct snake_case column names matching the actual DB schema
    // - followers table: user_id, follower_id
    // - users table: amount_of_follower, amount_of_following
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION fn_update_followers_counts()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE users
          SET amount_of_follower = amount_of_follower + 1
          WHERE id = NEW.user_id;

          UPDATE users
          SET amount_of_following = amount_of_following + 1
          WHERE id = NEW.follower_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE users
          SET amount_of_follower = amount_of_follower - 1
          WHERE id = OLD.user_id;

          UPDATE users
          SET amount_of_following = amount_of_following - 1
          WHERE id = OLD.follower_id;
        END IF;

        RETURN null;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER tr_increment_follower_counts
      AFTER INSERT OR DELETE ON "followers"
      FOR EACH ROW
      EXECUTE FUNCTION fn_update_followers_counts();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS tr_increment_follower_counts ON "followers";
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS fn_update_followers_counts();
    `);
  },
};
