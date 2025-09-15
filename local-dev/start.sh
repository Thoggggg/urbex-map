#!/bin/bash

# This script starts the complete local development environment.

# Exit immediately if a command fails
set -e

echo "--- Starting local development database ---"
# Use the -f flag to specify which compose file to use
sudo docker compose -f "$(dirname "$0")/docker-compose.db.yml" -p urbex-dev up -d

# Downloading dependencies
echo "--- Downloading dependencies ---"
npm install

# Initialize the database
echo "--- Initializing database ---"
cd server; npx dotenv-cli -e .env.development -- npx prisma migrate dev
cd ..
  

ending()
{
    echo "--- Stopping local development database ---"
    # Use the -f flag to specify which compose file to use
    sudo docker compose -f "$(dirname "$0")/docker-compose.db.yml" -p urbex-dev down >> /dev/null
}

trap ending INT

echo ""
echo "--- Starting frontend and backend with npm ---"
# Run the main npm dev command from the project root
npm run dev
