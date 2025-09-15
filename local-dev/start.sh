#!/bin/bash

# This script starts the complete local development environment.

# Exit immediately if a command fails
set -e

echo "--- Starting local development database ---"
# Use the -f flag to specify which compose file to use
# Use the -p flag to give the project a unique name to avoid conflicts
sudo docker compose -f "$(dirname "$0")/docker-compose.db.yml" -p urbex-dev up -d


# Initialize the database
cd server; npx dotenv-cli -e .env.development -- npx prisma migrate dev
cd ..
  
echo ""
echo "--- Starting frontend and backend with npm ---"
# Run the main npm dev command from the project root
npm run dev