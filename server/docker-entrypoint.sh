#!/bin/sh

# This script is the container's entrypoint.
# It ensures the database is up-to-date before starting the main application.

set -e

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
npx prisma migrate deploy

echo "Starting the application..."
exec node dist/index.js