# syntax=docker/dockerfile:1

# ---- Dependencies & Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy both manifests so pnpm can verify the lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies; mount the pnpm content-addressable store as a
# BuildKit cache so repeated builds reuse downloaded packages
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code (after deps to maximise layer-cache hits)
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ---- Production Image ----
# output: 'standalone' (next.config.mjs) produces .next/standalone — a
# self-contained server with only the auto-traced runtime dependencies, so
# the full node_modules directory never needs to be copied here.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root system user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone  — minimal server + auto-traced dependencies
# static      — hashed CSS/JS bundles (served by the standalone server)
# public      — unversioned assets, including atributos-2025.json fetched at runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

# No pnpm required; the standalone output ships its own minimal server
CMD ["node", "server.js"]
