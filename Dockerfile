# --- Stage 1: Build the Client ---
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./

# Build the static assets for the client.
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

WORKDIR /app

# Copy production dependencies manifest from the server builder
COPY --from=server-builder /app/server/package.json ./package.json

# Install ONLY the server's production dependencies
RUN npm install --omit=dev

# Copy the built server code, prisma schema, and generated client
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/@prisma/client ./node_modules/@prisma/client

# This is where our Express server will look for them.
COPY --from=client-builder /app/client/dist ./dist/public

# Copy the server's entrypoint script
COPY --from=server-builder /app/server/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# --- Stage 3: Final Production Image ---
# ... (all COPY commands are correct)

EXPOSE 3001

# [THE FIX] Use an absolute path for the entrypoint for maximum reliability.
ENTRYPOINT ["/app/docker-entrypoint.sh"]