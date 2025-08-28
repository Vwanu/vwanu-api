INSERT INTO "interests" 
("id","name","createdAt","updatedAt")
  VALUES (?, ?, current_timestamp, current_timestamp)
  ON CONFLICT("name") DO NOTHING RETURNING id;