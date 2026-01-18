# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
