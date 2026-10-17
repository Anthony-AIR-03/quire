#!/bin/sh
# Proves a backup restores: loads it into a throwaway Postgres container (no
# network, removed afterwards) and compares exact row counts with its manifest.
# Never touches the live database.
#   ./restore-test.sh <backup-dir>/<stamp>      # or <backup-dir> for the newest
set -eu

dir=${1:?usage: restore-test.sh <backup-dir>[/<stamp>]}
[ -f "$dir/quire.dump" ] || dir=$(ls -1d "$dir"/*/ 2>/dev/null | sort | tail -n 1)
dir=${dir%/}
[ -f "$dir/quire.dump" ] && [ -f "$dir/manifest.txt" ] || { echo "no backup in $dir"; exit 1; }

c=quire-restore-test-$$
trap 'docker rm -f "$c" >/dev/null 2>&1 || true' EXIT
docker run -d --name "$c" --network none \
  -e POSTGRES_USER=quire -e POSTGRES_PASSWORD=restore-test -e POSTGRES_DB=quire \
  postgres:17-alpine >/dev/null

# The image's init runs a socket-only server first; TCP answers once it's really up.
i=0
until docker exec "$c" pg_isready -h 127.0.0.1 -U quire -d quire >/dev/null 2>&1; do
  i=$((i + 1))
  [ "$i" -lt 60 ] || { echo "throwaway Postgres did not start"; exit 1; }
  sleep 1
done

docker exec -i "$c" pg_restore -U quire -d quire --no-owner --exit-on-error < "$dir/quire.dump"

COUNTS_SQL="select table_name || ' ' || (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"
restored=$(docker exec "$c" psql -U quire -d quire -tAc "$COUNTS_SQL")

if [ "$restored" = "$(cat "$dir/manifest.txt")" ]; then
  echo "restore OK: $(basename "$dir") ($(wc -l < "$dir/manifest.txt") tables, counts match)"
else
  echo "restore MISMATCH for $(basename "$dir") (expected, then restored):"
  cat "$dir/manifest.txt"
  echo ---
  echo "$restored"
  exit 1
fi
