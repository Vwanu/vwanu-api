const path = require('path');
const fs = require('fs');

const query = fs.readFileSync(
  path.resolve(
    __dirname,
    './queries',
    'fn_join_community_invitation_update.sql'
  ),
  'utf-8'
);

module.exports = {
  async up(queryInterface) {
    // Recreate the trigger function with the fixed column name
    // (community_roleId -> community_role_id on line 20)
    await queryInterface.sequelize.query(query);
  },

  async down(queryInterface) {
    // Revert to the buggy version (not recommended, but for rollback completeness)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION fn_join_community_invitation_update()
      RETURNS TRIGGER
      AS $$
      DECLARE p_role uuid;
      BEGIN


      IF TG_OP = 'UPDATE' THEN
      -- Insert the new user in the community_users table
        IF( NEW.response = true) THEN
          -- Check if the user is already a member of the community
          SELECT community_role_id
          INTO p_role
          FROM community_users
          WHERE user_id = NEW."guest_id" AND
          community_id = NEW."community_id";

          IF p_role IS NULL THEN
            INSERT INTO community_users (user_id, community_id, community_role_id, created_at)
            VALUES (NEW.guest_id, NEW.community_id, NEW.community_roleId, CURRENT_TIMESTAMP);
          ELSE

          -- check if it is the same role as the one in the community_users table

            IF p_role != NEW.community_role_id THEN
              UPDATE community_users
              SET community_role_id = NEW.community_role_id
              WHERE user_id = NEW.guest_id AND community_id = NEW.community_id;

            ELSE
              RAISE EXCEPTION 'User is already a member of the community';
            END IF;
            END IF;


          END IF;
        END IF;
          RETURN null;
      END;
      $$ LANGUAGE plpgsql;
    `);
  },
};
