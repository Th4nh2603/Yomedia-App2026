FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# Toolchain for native modules (cpu-features, ssh2, sharp, ...)
RUN apk add --no-cache python3 make g++

# Copy only server package manifest and install deps
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod=false --dangerously-allow-all-builds

# Copy server source code (context = apps/server)
COPY . ./

# Build Next.js app
RUN pnpm run build

# ---------- Runtime image ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# Copy built app and minimal files needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY next.config.mjs ./next.config.mjs

EXPOSE 3001

CMD ["pnpm", "start"]

