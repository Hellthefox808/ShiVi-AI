# Multi-stage production Dockerfile for ShiVi X100+ Enterprise Platform
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.7.0

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY domains/ ./domains/
COPY apps/ ./apps/
RUN pnpm install --frozen-lockfile || pnpm install

# Build stage
FROM dependencies AS builder
COPY . .
RUN pnpm --recursive run build

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/domains ./domains
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/public ./public

# Run as non-root node user for SecOps compliance
USER node

EXPOSE 3000

CMD ["node", "apps/kernel-api/dist/server.js"]
