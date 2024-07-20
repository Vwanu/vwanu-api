INSERT INTO "countries" 
("id","name","initials","createdAt","updatedAt")
  VALUES (?, ?, ?, current_timestamp, current_timestamp)
  ON CONFLICT DO NOTHING RETURNING id;