# Dockerfile for Turborepo Monorepo - Blink Web App
# This builds and deploys the apps/web Nuxt application

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./
COPY turbo.json ./

# Copy all workspace packages
COPY packages ./packages
COPY apps/web ./apps/web

# Install all dependencies (including workspaces)
RUN npm ci

# Build the web app using Turborepo
# Turbo will build dependencies (packages/types, packages/config) first
RUN npx turbo run build --filter=@blink/web

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy built application from builder stage
# Nuxt build output is in apps/web/.output
COPY --from=builder /app/apps/web/.output ./.output

# Expose port (Railway sets PORT env var)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the Nuxt application
CMD ["node", ".output/server/index.mjs"]
