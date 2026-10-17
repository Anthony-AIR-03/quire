#!/bin/sh
# Pull-based update (personal branch only). Run from cron next to compose.yml and .env.
# Pulls the published app image; `up -d` recreates the container only when the
# image actually changed, so an unchanged run is a cheap no-op.
set -eu
cd "$(dirname "$0")"

before=$(docker image inspect -f '{{.Id}}' ghcr.io/anthony-air-03/quire:personal 2>/dev/null || echo none)
docker compose pull --quiet app
after=$(docker image inspect -f '{{.Id}}' ghcr.io/anthony-air-03/quire:personal)

docker compose up -d --remove-orphans --quiet-pull

if [ "$before" != "$after" ]; then
  echo "$(date -Iseconds) updated app image ${before#sha256:} -> ${after#sha256:}"
  docker image prune -f >/dev/null
fi
