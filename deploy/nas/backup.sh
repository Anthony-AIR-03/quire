#!/bin/sh
# Nightly Postgres backup (personal branch only). Run from cron next to compose.yml:
#   ./backup.sh <backup-dir>
# Writes <backup-dir>/<UTC stamp>/{quire.dump,manifest.txt} and keeps the newest
# BACKUP_RETAIN (default 7). Keep <backup-dir> outside the deploy directory and
# private: the dump holds the owner account and every clip.
# One line per run, so the cron log stays readable. Check one with restore-test.sh.
set -eu
cd "$(dirname "$0")"

root=${1:?usage: backup.sh <backup-dir>}
retain=${BACKUP_RETAIN:-7}
stamp=$(date -u +%Y%m%dT%H%M%SZ)
dest="$root/$stamp"
umask 077

fail() {
  echo "$(date -Iseconds) backup FAILED: $*"
  rm -rf "$dest"
  exit 1
}

# Exact row count per table, compared by restore-test.sh after a restore.
COUNTS_SQL="select table_name || ' ' || (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"

mkdir -p "$dest" || fail "cannot create $dest"
docker compose exec -T db pg_dump -U quire -d quire --no-owner --format=custom \
  > "$dest/quire.dump" 2> "$dest/error.log" || fail "pg_dump: $(cat "$dest/error.log")"
docker compose exec -T db psql -U quire -d quire -tAc "$COUNTS_SQL" \
  > "$dest/manifest.txt" 2> "$dest/error.log" || fail "row counts: $(cat "$dest/error.log")"
rm -f "$dest/error.log"
[ -s "$dest/quire.dump" ] || fail "empty dump"

# Prune: everything but the newest $retain backup directories.
ls -1d "$root"/*/ 2>/dev/null | sort -r | tail -n +"$((retain + 1))" | while read -r old; do
  rm -rf "$old"
done

size=$(du -h "$dest/quire.dump" | cut -f1)
rows=$(awk '{ n += $2 } END { print n + 0 }' "$dest/manifest.txt")
echo "$(date -Iseconds) backup $stamp ok ($size, $rows rows)"
