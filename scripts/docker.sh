#!/bin/bash

# Note: This script assumes the user has been added to the 'docker' group
# to avoid running commands with sudo. If you haven't, run:
# `sudo usermod -aG docker $USER` and then log out and log back in.

# Exit immediately if any command fails.
set -e

echo "--- Stopping and removing all containers, volumes, and networks... ---"
# The '-v' flag removes the named volumes, ensuring a clean slate.
docker compose down -v

echo ""
echo "--- Building fresh images from Dockerfiles, ignoring cache... ---"
# The --no-cache flag forces a complete rebuild of all layers.
docker compose build --no-cache

echo ""
echo "--- Starting all services in detached mode... ---"
# The -d flag runs the containers in the background.
docker compose up -d

echo ""
echo "--- Docker environment is up and running. Current status: ---"
# Display the status of the running containers.
docker compose ps