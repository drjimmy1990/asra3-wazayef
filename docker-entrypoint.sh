#!/bin/sh
set -e

mkdir -p /app/.data/uploads /app/.data/reels /app/.data/social-media

if [ ! -f /app/.data/store.json ] && [ -f /app/seed/store.seed.json ]; then
  echo "[Asra3] Initializing /app/.data/store.json with pre-seeded GCC companies..."
  cp /app/seed/store.seed.json /app/.data/store.json
fi

chown -R nextjs:nodejs /app/.data

exec su-exec nextjs:nodejs node server.js
