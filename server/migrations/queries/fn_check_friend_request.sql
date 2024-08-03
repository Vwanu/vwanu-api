CREATE OR REPLACE FUNCTION fn_check_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    requester_id UUID;
    friend_id UUID;
    requester RECORD;
    friend RECORD;
    already_friends BOOLEAN;
    requested_friendship BOOLEAN;
BEGIN

    -- Assign the values from the NEW record
    requester_id := NEW.requester_id;
    friend_id := NEW.friend_id;

    -- Check if requester is trying to friend themselves
    IF requester_id = friend_id THEN
        RAISE EXCEPTION 'It is not permitted to be your own friend';
    END IF;

    -- Fetch the requester and friend records
    SELECT * INTO requester FROM users WHERE id = requester_id;
    SELECT * INTO friend FROM users WHERE id = friend_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Your profile or the person you want to be friends with was not found';
    END IF;

    -- Check if there is a previously denied friend request
    IF EXISTS (
        SELECT 1 FROM undesired_friends 
        WHERE user_id = requester_id AND undesired_user_id = friend_id
    ) THEN
        -- Remove the previous denial if any
        DELETE FROM undesired_friends WHERE user_id = requester_id AND undesired_user_id = friend_id;
    END IF;

    -- Check if the friend has previously denied the request
    IF EXISTS (
        SELECT 1 FROM undesired_friends 
        WHERE user_id = friend_id AND undesired_user_id = requester_id
    ) THEN
        RAISE EXCEPTION 'Your previous friend request was denied';
    END IF;

    -- Check if they are already friends
    SELECT EXISTS (
        SELECT 1 FROM friends 
        WHERE (user_id = requester_id AND friend_id = friend_id) 
           OR (user_id = friend_id AND friend_id = requester_id)
    ) INTO already_friends;

    IF already_friends THEN
        RAISE EXCEPTION 'You are already friends';
    END IF;

    -- Check if a friend request has already been sent
    SELECT EXISTS (
        SELECT 1 FROM friend_requests 
        WHERE requester_id = requester_id AND friend_id = friend_id
    ) INTO requested_friendship;

    IF requested_friendship THEN
        RAISE EXCEPTION 'You already requested to be friends';
    END IF;

    -- Proceed with the insert operation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;