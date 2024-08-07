CREATE OR REPLACE FUNCTION fn_handle_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.accept = TRUE THEN
        -- Insert into the friends table if the request is accepted
        INSERT INTO friends (user_id_1, user_id_2)
        VALUES (NEW.requester_id, NEW.receiver_id);
    ELSE
        -- Insert into the undesired_friends table if the request is not accepted
        INSERT INTO undesired_friends (user_id, undesired_user_id)
        VALUES (NEW.receiver_id, NEW.requester_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
