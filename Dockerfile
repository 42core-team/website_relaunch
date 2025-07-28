# Multi-stage build for NextJS production
FROM node:18-alpine AS base

RUN apk add git

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY frontend/package.json frontend/package-lock.json* ./

# Configure npm for better reliability and add retry logic
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000

# Clean npm cache first
RUN npm cache clean --force

# Install with verbose logging and retry on failure
RUN npm ci --verbose --no-audit --no-fund || \
    (echo "First npm install failed, retrying..." && npm ci --verbose --no-audit --no-fund) || \
    (echo "Second npm install failed, trying npm install..." && npm install --verbose --no-audit --no-fund)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Set dummy DATABASE_URL for Prisma client generation (not used at build time)
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Debug: Check what was built
RUN echo "=== Build output ===" && ls -la .next/
RUN echo "=== Standalone check ===" && ls -la .next/standalone/ || echo "No standalone directory"

# Verify standalone build exists
RUN test -d .next/standalone || (echo "ERROR: Standalone build failed" && exit 1)

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# Start the standalone server
CMD ["node", "server.js"]
