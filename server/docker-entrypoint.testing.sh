#!/bin/bash
# check if docker is up and running
# if docker ps  does not have a container runing postgresql then start it

echo "Checking if the database is up"
docker ps | grep postgres
if [ $? -ne 0 ]; then
  echo "Database is not running. Starting database"
  docker run --name test-postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=123456 -e POSTGRES_USER=vwanu -e POSTGRES_DB=social_media postgres:12
fi
echo "Database is running"
echo "Waiting for the database to be ready..."
#giving the database some time to start
sleep 20

./wait-for localhost:5432 
# echo "Database is up"

echo "Migrating database"
NODE_ENV=test npm run migrate

echo "Seeding database"
NODE_ENV=test npm run seed


# echo "Starting server"
# npm run "test:local" 