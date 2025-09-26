# --- Stage 1: Build the Client ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build


# --- Stage 2: Build the Server ---
FROM node:18-bullseye-slim AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build


# --- Stage 3: Final Production Image ---
FROM node:18-bullseye-slim

# [THE FIX] Install 'su-exec' for changing users.
RUN apt-get update && apt-get install -y gosu procps postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# [THE FIX] Create a non-root user and group.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy production dependencies manifest from the server builder
COPY --from=server-builder /app/server/package.json ./package.json

# Install ONLY the server's production dependencies
RUN npm install --omit=dev

# Copy the built server code, prisma schema, and generated client
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy the built client assets into a 'public' folder
COPY --from=client-builder /app/client/dist ./dist/public

# Copy the server's entrypoint script
# Note the source path is now from the server-builder stage
COPY --from=server-builder /app/server/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# [THE FIX] Create the uploads directory during the build.
# The entrypoint script will fix its permissions at runtime.
RUN mkdir -p /app/uploads

# [THE FIX] Set ownership of the APP directory, but the entrypoint will fix the volume.
RUN chown -R appuser:nodejs /app

# The container will start as root to run the entrypoint script.
# The script itself will then drop privileges to 'appuser'.

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]