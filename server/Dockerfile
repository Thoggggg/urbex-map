# [THE DEFINITIVE FIX] Use a Debian-based 'slim' image for maximum compatibility with Prisma.
FROM node:18-bullseye-slim

WORKDIR /app

# Install ALL dependencies for the build
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Generate the Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Set the entrypoint to run migrations on startup
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# The command to run the application
CMD ["node", "dist/index.js"]