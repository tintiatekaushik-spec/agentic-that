# Tinitiate WA Workflows — single-container deploy.
# Works on Railway / Render / Fly.io / any Docker host.
#
# SQLite lives on disk: mount a persistent volume and point DATABASE_PATH at it,
# e.g. volume at /data  +  DATABASE_PATH=/data/tinitiate.db
#
# node:20-slim (glibc) so better-sqlite3 uses its prebuilt native binary.
FROM node:20-slim

WORKDIR /app

# Install dependencies first for layer caching.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# `start` honors the platform's PORT env var (falls back to 3000).
CMD ["npm", "start"]
