# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Prune dev dependencies to keep only production deps
RUN pnpm prune --prod

# Stage 2: Production
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies and built artifacts
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Start the microservice
CMD ["node", "dist/src/main.js"]
