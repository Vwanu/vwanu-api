CREATE OR REPLACE FUNCTION fn_sync_amount_of_friends()
    RETURNS TRIGGER AS $$
  BEGIN
  IF TG_OP = 'INSERT' THEN
      -- Increment the friends count for the user being followed
       UPDATE users
       SET amount_of_friend = amount_of_friend + 1
       WHERE id = NEW.user_one_id 
       OR id = NEW.user_two_id;
  ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the friends count for the user being unfollowed
       UPDATE users
       SET amount_of_friend = amount_of_friend - 1
        WHERE id = NEW.user_one_id 
       OR id = NEW.user_two_id;
   END IF;
    
    RETURN null;
  END;
$$ LANGUAGE plpgsql;