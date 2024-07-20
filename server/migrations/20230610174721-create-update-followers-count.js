module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
CREATE OR REPLACE FUNCTION fn_update_followers_counts()
    RETURNS TRIGGER AS $$
  BEGIN
  IF TG_OP = 'INSERT' THEN
      -- Increment the followers count for the user being followed
       UPDATE users
       SET amount_of_follower = amount_of_follower + 1
       WHERE id = NEW.user_id;
      -- Increment the following count for the follower
       UPDATE users
       SET amount_of_following = amount_of_following + 1
       WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the followers count for the user being unfollowed
       UPDATE users
       SET amount_of_follower = amount_of_follower - 1
       WHERE id = OLD.user_id;
      -- Decrement the following count for the follower
       UPDATE users
       SET amount_of_following = amount_of_following - 1
       WHERE id = OLD.follower_id;
   END IF;
    
    RETURN null;
  END;
$$ LANGUAGE plpgsql;
`);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXIST fn_update_followers_counts();`
    );
  },
};
