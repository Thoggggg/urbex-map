# Use a Debian-based Node.js 'slim' image for broad compatibility with native binaries like Prisma.
FROM node:18-bullseye-slim

# Set the working directory in the container.
WORKDIR /app

# --- Dependency Installation ---
# Copy package manifests first to leverage Docker's build cache.
COPY package*.json ./
RUN npm install

# --- Source Code & Build ---
# Copy the rest of the application source code.
COPY . .

# Generate the Prisma client based on the schema.
RUN npx prisma generate

# Build the TypeScript source into JavaScript.
RUN npm run build

# Remove development dependencies to reduce the final image size.
RUN npm prune --production

# --- Container Startup ---
# Make the entrypoint script executable.
RUN chmod +x /app/docker-entrypoint.sh

# Set the entrypoint to our custom script that runs migrations.
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Provide the default command to run the application.
# This command is passed as arguments to the ENTRYPOINT script.
CMD ["node", "dist/index.js"]