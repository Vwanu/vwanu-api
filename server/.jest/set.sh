docker run --name test-postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=123456 -e POSTGRES_USER=vwanu -e POSTGRES_DB=social_media postgres:12

# Wait for the database to be ready
./wait-for localhost:5432

# Migrate the database
NODE_ENV=test npm run migrate
