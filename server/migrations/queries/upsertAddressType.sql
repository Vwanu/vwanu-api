INSERT INTO "address_types"
("id","name","description","created_at","updated_at")
VALUES (?, ?, ?, current_timestamp, current_timestamp)
ON CONFLICT DO NOTHING RETURNING id;