#!/bin/bash

# A robust script to set up and run the local development environment.
# It is safe to run this script multiple times.

# Exit immediately if a command fails
set -e

# --- Configuration ---
# Navigate to the project root, regardless of where the script is run from
cd "$(dirname "$0")/.."

ROOT_ENV_FILE=".env"
SERVER_DEV_ENV_FILE="server/.env.development"
PASSWORD_PLACEHOLDER="your_password_here"

# --- Functions ---
setup_env_file() {
  local template_file="$1.example"
  local target_file="$2"
  if [ ! -f "$target_file" ]; then
    echo "--- Creating $target_file ---"
    cp "$template_file" "$target_file"
    echo "Created $target_file. You may need to edit the password inside it."
  fi
}

check_password() {
  if grep -q "$PASSWORD_PLACEHOLDER" "$ROOT_ENV_FILE"; then
    echo ""
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "!!! WARNING: Your database password is still a placeholder. !!!"
    echo "!!! Please edit the .env file and set a secure password.    !!!"
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo ""
    sleep 3
  fi
}

# --- Main Execution ---

echo "--- 1. Setting up environment files ---"
setup_env_file ".env" "$ROOT_ENV_FILE"
setup_env_file "server/.env" "$SERVER_DEV_ENV_FILE"
check_password

echo "--- 2. Starting local development database ---"
docker compose -f "scripts/docker-compose.db.yml" -p urbex-dev up -d

echo "--- 3. Installing dependencies ---"
npm install

echo "--- 4. Initializing database schema ---"
# We run migrate dev which is safe for development. It will prompt for a name on the first run.
# It will do nothing if the database is already up-to-date.
cd server
npx dotenv-cli -e .env.development -- npx prisma migrate dev
cd ..

# --- Graceful Shutdown ---
cleanup() {
    echo ""
    echo "--- Shutting down local development database ---"
    docker compose -f "scripts/docker-compose.db.yml" -p urbex-dev down
}
trap cleanup EXIT # Run cleanup when the script exits for any reason (Ctrl+C, normal exit)

# --- Start the Application ---
echo ""
echo "--- 5. Starting frontend and backend servers ---"
# Run the main npm dev command from the project root
npm run dev