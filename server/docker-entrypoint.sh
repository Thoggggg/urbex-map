#!/bin/sh

# This script is the container's entrypoint.
# It ensures the database is up-to-date before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the Prisma migration command for production environments.
echo "Running database migrations..."
npx prisma migrate deploy

# Execute the main command (passed to this script).
# This will be `node dist/index.js` from the Dockerfile's CMD.
exec "$@"