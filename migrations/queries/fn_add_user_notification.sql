CREATE OR REPLACE FUNCTION fn_add_user_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_notification_slug RECORD;
BEGIN
    -- Ensure unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_notification_types_user_id_notification_slug_key'
    ) THEN
        ALTER TABLE user_notification_types 
        ADD CONSTRAINT user_notification_types_user_id_notification_slug_key 
        UNIQUE (user_id, notification_slug);
    END IF;

    -- Loop through all notification slugs
    FOR v_notification_slug IN SELECT notification_slug FROM notification_types LOOP
        -- Insert a new row into user_notification_types for each notification type
        -- If the combination already exists, do nothing
        INSERT INTO user_notification_types (user_id, notification_slug, text, email, sound)
        VALUES (NEW.id, v_notification_slug.notification_slug, FALSE, FALSE, TRUE)
        ON CONFLICT (user_id, notification_slug) DO NOTHING;
    END LOOP;

    -- Return the new row to indicate successful insertion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;