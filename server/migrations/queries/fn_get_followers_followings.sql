CREATE TYPE user_result AS (
  data users,
  total INTEGER
);
CREATE OR REPLACE FUNCTION get_followers_or_following(
    user_id UUID,
    is_followers BOOLEAN DEFAULT TRUE,
    OUT result user_result 
)
-- RETURNS SETOF users
AS $$
BEGIN
    IF is_followers THEN
        --RETURN QUERY
        result.data:=(SELECT u.*
        FROM users u
        INNER JOIN followers uf ON u.id = uf.follower_id
        WHERE uf.user_id = user_id);
        result.total:=(SELECT COUNT(*) FROM users);
    ELSE
        --RETURN QUERY
        result.data:=(SELECT u.*
        FROM users u
        INNER JOIN followers uf ON u.id = uf.user_id
        WHERE uf.follower_id = user_id);
        result.total:=(SELECT COUNT(*) FROM users);
    END IF;
END;
$$ LANGUAGE plpgsql;