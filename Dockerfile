# Multi-stage build for NoOrg Multi-Agent Framework
FROM node:20-alpine AS base

# Install security updates and build tools
RUN apk update && apk upgrade && \
    apk add --no-cache \
        dumb-init \
        curl \
        wget \
        git \
        openssl \
        ca-certificates \
        tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S noorg && \
    adduser -S noorg -u 1001 -G noorg

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tests/ ./tests/
COPY scripts/ ./scripts/
COPY examples/ ./examples/

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/output /app/coverage && \
    chown -R noorg:noorg /app

# Switch to non-root user
USER noorg

# Expose development ports
EXPOSE 3000 9090 9229

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start in development mode
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tests/ ./tests/
COPY scripts/ ./scripts/

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy necessary runtime files
COPY --from=builder /app/src/prompts ./src/prompts
COPY --from=builder /app/src/examples ./src/examples

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/logs /app/output /app/backups /app/coverage && \
    chown -R noorg:noorg /app && \
    chmod -R 755 /app

# Create log directory with write permissions
RUN mkdir -p /app/logs && \
    chown -R noorg:noorg /app/logs && \
    chmod -R 755 /app/logs

# Switch to non-root user
USER noorg

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV METRICS_PORT=9090

# Expose ports
EXPOSE 3000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Security: Set resource limits
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]

# Production with clustering
FROM production AS production-cluster

# Install PM2 for process management
USER root
RUN npm install -g pm2
USER noorg

# Use PM2 for production clustering
CMD ["pm2-runtime", "dist/index.js", "--name", "noorg", "--instances", "max"]

# Testing stage
FROM base AS testing

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./
COPY .prettierrc ./

# Install all dependencies
RUN npm ci

# Copy all source and test files
COPY src/ ./src/
COPY tests/ ./tests/
COPY scripts/ ./scripts/

# Create necessary directories
RUN mkdir -p /app/coverage /app/logs /app/output && \
    chown -R noorg:noorg /app

# Switch to non-root user
USER noorg

# Health check for testing
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD echo "Testing environment ready" || exit 1

# Default command for testing
CMD ["npm", "test"]

# Documentation stage
FROM base AS documentation

# Install documentation tools
RUN npm install -g docsify-cli

# Copy documentation
COPY docs/ ./docs/
COPY scripts/generate-docs-structure.js ./scripts/

# Create necessary directories
RUN mkdir -p /app/docs-dist && \
    chown -R noorg:noorg /app

# Switch to non-root user
USER noorg

# Generate and serve documentation
CMD ["npx", "docsify", "serve", "docs"]
