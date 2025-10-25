CREATE OR REPLACE FUNCTION fn_sync_community_participant_counts()
RETURNS TRIGGER
AS $$
DECLARE p_role varchar(10);
BEGIN


IF TG_OP = 'INSERT' THEN
-- Increment the admin| member count. 
	SELECT "name" from community_roles 
	INTO p_role
	WHERE community_roles.id= NEW.community_role_id;
    
	IF p_role ='member' THEN
		UPDATE communities
		SET num_members = num_members + 1
		WHERE id = NEW.community_id;
	ELSIF p_role ='admin' THEN
		UPDATE communities
		SET num_admins = num_admins + 1
		WHERE id = NEW.community_id;
	END IF;
	
ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the the admin| member count.
      SELECT "name" from community_roles 
	  INTO p_role
	  WHERE community_roles.id= OLD.community_role_id;
	  IF p_role ='member' THEN
      	 UPDATE communities
         SET num_members = num_members - 1
         WHERE id = OLD.community_id;
      ELSIF p_role ='admin' THEN
		UPDATE communities
		SET num_admins = num_admins - 1
		WHERE id = OLD.community_id;
   	END IF;
   END IF;
RETURN null;
END; 
$$ LANGUAGE "plpgsql";

