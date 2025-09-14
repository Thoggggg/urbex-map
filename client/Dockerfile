# Start with a modern Node.js Long-Term Support version
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the static assets for production.
RUN npm run build

# --- Install and configure Nginx ---
RUN apk add --update nginx && \
    rm -rf /var/cache/apk/*

# [THE FIX] Copy our TWO configuration files to their respective locations.
# 1. The main config, overwriting the default.
COPY nginx.conf /etc/nginx/nginx.conf
# 2. The server block config, which will be included by the main config.
COPY nginx.prod.conf /etc/nginx/conf.d/nginx.prod.conf

# Clean out the default Nginx content and copy our app's build output
RUN rm -rf /usr/share/nginx/html/*
RUN cp -a /app/dist/. /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]