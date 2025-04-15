INSERT INTO "states" 
("id", "name", "country_id", "initials", "created_at", "updated_at")
  VALUES (?, ?, ?, ?, current_timestamp, current_timestamp)
  ON CONFLICT (id) DO NOTHING RETURNING id;