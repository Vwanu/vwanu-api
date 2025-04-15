INSERT INTO "cities" 
("id", "name", "state_id", "created_at", "updated_at")
VALUES (?, ?, ?, current_timestamp, current_timestamp)
ON CONFLICT (id) DO NOTHING RETURNING id;