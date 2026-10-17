#!/bin/sh
# Pull-based update (personal branch only). Run from cron next to compose.yml and .env.
# Pulls the published app image; `up -d` recreates the container only when the
# image actually changed, so an unchanged run is a silent no-op. Output only on
# change or failure, so the cron log stays readable.
set -eu
cd "$(dirname "$0")"
image=ghcr.io/anthony-air-03/quire:personal

run() {
  if ! out=$("$@" 2>&1); then
    echo "$(date -Iseconds) FAILED: $*"
    echo "$out"
    exit 1
  fi
}

before=$(docker images -q --no-trunc "$image")
run docker compose pull --quiet app
after=$(docker images -q --no-trunc "$image")
run docker compose up -d --remove-orphans --quiet-pull

if [ "$before" != "$after" ]; then
  echo "$(date -Iseconds) updated app image ${before#sha256:} -> ${after#sha256:}"
  docker image prune -f >/dev/null
fi
