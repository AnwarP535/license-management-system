# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start the application in production mode
CMD ["node", "dist/main"]

# Stage 3: Development stage (for docker-compose with volumes)
FROM node:18-alpine AS development

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy source code (will be overridden by volume in docker-compose)
COPY . .

# Expose port
EXPOSE 8080

# Use entrypoint to handle bcrypt rebuild on startup
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
