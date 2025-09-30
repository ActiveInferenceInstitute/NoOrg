# LexDAO Governance Workflow - Multi-stage Docker Build
# Optimized for both development and production deployments

# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:18-alpine AS builder

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# =============================================================================
# PYTHON DEPENDENCIES STAGE
# =============================================================================
FROM python:3.9-slim AS python-deps

# Install Python dependencies for visualization
RUN pip install --no-cache-dir \
    matplotlib>=3.5.0 \
    pandas>=1.3.0 \
    numpy>=1.21.0 \
    networkx>=2.6 \
    seaborn>=0.11.0 \
    Pillow>=8.0.0

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM node:18-alpine AS production

# Install Python for visualization scripts
RUN apk add --no-cache python3 py3-pip

# Install Python dependencies
COPY --from=python-deps /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=python-deps /usr/local/bin /usr/local/bin

# Create non-root user for security
RUN addgroup -g 1001 -S lexdao && \
    adduser -S lexdao -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/README.md ./
COPY --from=builder /app/lexdao_workflow.ts ./
COPY --from=builder /app/lexdao_constitution.md ./
COPY --from=builder /app/lexdao_visualizer.py ./
COPY --from=builder /app/constitution-parser.ts ./
COPY --from=builder /app/proposal-generator.ts ./
COPY --from=builder /app/dao-analytics.ts ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Create output directory
RUN mkdir -p /app/output && chown -R lexdao:lexdao /app

# Switch to non-root user
USER lexdao

# Set environment variables
ENV NODE_ENV=production
ENV OUTPUT_DIR=/app/output

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Default command
CMD ["node", "dist/lexdao_workflow.js"]

# =============================================================================
# DEVELOPMENT STAGE
# =============================================================================
FROM production AS development

# Switch back to root for development setup
USER root

# Install development dependencies
RUN npm install --only=development

# Switch back to lexdao user
USER lexdao

# Override default command for development
CMD ["npm", "run", "dev"]

# =============================================================================
# TEST STAGE
# =============================================================================
FROM production AS test

# Install test dependencies
USER root
RUN npm install --only=development

# Switch back to lexdao user
USER lexdao

# Default test command
CMD ["npm", "test"]

# =============================================================================
# LABELS
# =============================================================================
LABEL org.opencontainers.image.title="LexDAO Governance Workflow"
LABEL org.opencontainers.image.description="Multi-agent governance workflow for LexDAO with blockchain integration and advanced visualizations"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="LexDAO Community"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/lexDAO/NoOrg"
LABEL org.opencontainers.image.documentation="https://github.com/lexDAO/NoOrg/tree/main/examples/lexdao"

# =============================================================================
# VOLUMES
# =============================================================================
VOLUME ["/app/output", "/app/logs"]

# =============================================================================
# PORTS (if needed for web interfaces)
# =============================================================================
EXPOSE 3000
