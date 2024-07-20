INSERT INTO users 
  ("first_name","last_name", "email", "password","created_at", "updated_at" )
  VALUES (?,?,?,?, current_timestamp, current_timestamp)
  ON CONFLICT DO NOTHING RETURNING id;