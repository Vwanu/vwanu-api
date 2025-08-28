INSERT INTO "forums"
("id","name","description","cover_picture","created_at","updated_at")
   VALUES (?, ?, ?,?, current_timestamp, current_timestamp)
  ON CONFLICT("name") DO NOTHING;
