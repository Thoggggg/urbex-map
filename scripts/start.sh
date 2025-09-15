#!/bin/bash

# A robust script to set up and run the local development environment.
# It is safe to run this script multiple times.

# Exit immediately if a command fails
set -e

# --- Configuration ---
cd "$(dirname "$0")/.." # Navigate to project root

ROOT_ENV_FILE=".env"
SERVER_DEV_ENV_FILE="server/.env.development"
PASSWORD_PLACEHOLDER="your_password_here"
DB_CONTAINER_NAME="urbex-dev-db-1" # Match the project name in docker compose

# --- Functions ---
setup_env_file() {
  local template_file="$1.example"
  local target_file="$2"
  if [ ! -f "$target_file" ]; then
    echo "--- Creating $target_file ---"
    cp "$template_file" "$target_file"
  fi
}

# --- Main Execution ---

echo "--- 1. Setting up environment files ---"
setup_env_file ".env" "$ROOT_ENV_FILE"
setup_env_file "server/.env" "$SERVER_DEV_ENV_FILE"

# --- CRITICAL STEP: Password Validation ---
if grep -q "$PASSWORD_PLACEHOLDER" "$ROOT_ENV_FILE"; then
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!!! SETUP REQUIRED: You must set a database password.               !!!"
  echo ""
  echo "!!! Please edit the following two files and replace                 !!!"
  echo "!!! '$PASSWORD_PLACEHOLDER' with a secure password:          !!!"
  echo "!!!   1. $ROOT_ENV_FILE                                             !!!"
  echo "!!!   2. $SERVER_DEV_ENV_FILE                                       !!!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo ""
  # Exit the script, forcing the user to take action.
  exit 1
fi

echo "--- 2. Starting local development database ---"
# Check if the DB volume exists. If it does, the DB is already initialized.
# If we change the password, we must destroy the old volume.
# This part is complex, so for now we will rely on the user doing it manually
# if they change the password after the first run.
docker compose -f "scripts/docker-compose.db.yml" -p urbex-dev up -d

echo "--- 3. Installing dependencies ---"
npm install

echo "--- 4. Initializing database schema (if needed) ---"
cd server
npx dotenv-cli -e .env.development -- npx prisma migrate dev --skip-generate
cd ..

# --- Graceful Shutdown ---
cleanup() {
    echo ""
    echo "--- Shutting down local development database ---"
    docker compose -f "scripts/docker-compose.db.yml" -p urbex-dev down
}
trap cleanup EXIT

# --- Start the Application ---
echo ""
echo "--- 5. Starting frontend and backend servers ---"
npm run dev