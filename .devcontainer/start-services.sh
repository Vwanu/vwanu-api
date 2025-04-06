#!/bin/bash
set -e

echo "Starting PostgreSQL service..."
# Start PostgreSQL as the postgres user in the background
su postgres -c 'pg_ctl -D /var/lib/postgresql/data start'
echo "PostgreSQL started successfully."

echo "Starting Redis service..."
# Start Redis in the background
redis-server --daemonize yes
echo "Redis started successfully."

echo "All services are running. Container is ready!"

# Keep the container running
exec sleep infinity 