#!/bin/sh
set -e

echo "Setting ownership for /app/uploads..."
chown -R appuser:nodejs /app/uploads

# --- Wait for PostgreSQL to be ready ---
echo "Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U "${POSTGRES_USER}"
do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "Database is ready. Continuing..."

# Check if the DATABASE_URL is set. If not, exit with an error.
if [ -z "${DATABASE_URL}" ]; then
  echo "FATAL: DATABASE_URL environment variable is not set."
  exit 1
fi

echo "Running database migrations..."
gosu appuser npx prisma migrate deploy

echo "Starting the application..."
exec gosu appuser node dist/index.js