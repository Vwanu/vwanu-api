-- Create custom type for user result
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_result') THEN
        CREATE TYPE user_result AS (
            id UUID,
            email VARCHAR,
            "firstName" VARCHAR,
            "lastName" VARCHAR,
            total INTEGER
        );
    END IF;
END $$;

-- Create function to get followers or following
CREATE OR REPLACE FUNCTION get_followers_or_following(
    user_id UUID,
    is_followers BOOLEAN DEFAULT TRUE,
    OUT result user_result
)
RETURNS user_result
AS $$
DECLARE
    user_record RECORD;
    total_count INTEGER;
BEGIN
    IF is_followers THEN
        -- Get followers and count
        SELECT u.id, u.email, u."firstName", u."lastName"
        INTO user_record
        FROM users u
        INNER JOIN user_follower uf ON u.id = uf.follower_id
        WHERE uf.user_id = $1
        LIMIT 1;
        
        SELECT COUNT(*)
        INTO total_count
        FROM user_follower uf
        WHERE uf.user_id = $1;
    ELSE
        -- Get following and count
        SELECT u.id, u.email, u."firstName", u."lastName"
        INTO user_record
        FROM users u
        INNER JOIN user_follower uf ON u.id = uf.user_id
        WHERE uf.follower_id = $1
        LIMIT 1;
        
        SELECT COUNT(*)
        INTO total_count
        FROM user_follower uf
        WHERE uf.follower_id = $1;
    END IF;
    
    -- Build result
    result.id := user_record.id;
    result.email := user_record.email;
    result."firstName" := user_record."firstName";
    result."lastName" := user_record."lastName";
    result.total := total_count;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;