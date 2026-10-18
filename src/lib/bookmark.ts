import { openDb } from "./db";

/**
 * Where a reader stopped in an issue or a kept piece: the sheet they last
 * turned to and, on a piece, the paragraph at the top of the screen. One row
 * per reader per item, so it follows the reader from device to device.
 */
export type SavedPlace = {
  sheet: number;
  /** Index of the paragraph in the piece's blocks, or null for the top of the sheet. */
  block: number | null;
  /** The paragraph's opening words, to check it is still the same text. */
  start: string | null;
};

export type Bookmark = SavedPlace & {
  readerId: string;
  itemId: string;
  savedAt: string;
};

export type BookmarkStore = {
  get: (readerId: string, itemId: string) => Promise<Bookmark | null>;
  set: (readerId: string, itemId: string, place: SavedPlace) => Promise<Bookmark>;
  removeItem: (itemId: string) => Promise<void>;
};

const START_WORDS = 8;
const START_CHARS = 80;

/** The opening words of a paragraph, whitespace folded, short enough to store. */
export function blockStart(text: string): string {
  return text.trim().split(/\s+/).slice(0, START_WORDS).join(" ").slice(0, START_CHARS);
}

/** The paragraph on screen still opens with the words that were saved. */
export function blockMatches(text: string, start: string | null): boolean {
  if (!start) return false;
  return blockStart(text) === blockStart(start);
}

/** A sheet worth offering to go back to: past the cover and still in the issue. */
export function resumeSheet(bookmark: Pick<SavedPlace, "sheet"> | null, sheetCount: number): number | null {
  if (!bookmark) return null;
  const sheet = Math.trunc(bookmark.sheet);
  if (!Number.isFinite(sheet) || sheet <= 0 || sheet >= sheetCount) return null;
  return sheet;
}

function bookmarkFromRow(row: Record<string, unknown>): Bookmark {
  const block = row.block === null || row.block === undefined ? null : Number(row.block);
  return {
    readerId: String(row.reader_id),
    itemId: String(row.item_id),
    sheet: Number(row.sheet),
    block: block !== null && Number.isFinite(block) ? block : null,
    start: typeof row.block_start === "string" ? row.block_start : null,
    savedAt: new Date(String(row.saved_at)).toISOString(),
  };
}

export async function bookmarkStore(): Promise<BookmarkStore> {
  const db = await openDb();
  return {
    async get(readerId, itemId) {
      if (!readerId || !itemId) return null;
      const { rows } = await db.query(
        "select reader_id, item_id, sheet, block, block_start, saved_at from bookmarks where reader_id = $1 and item_id = $2",
        [readerId, itemId],
      );
      const row = rows[0];
      return row ? bookmarkFromRow(row) : null;
    },
    async set(readerId, itemId, place) {
      const sheet = Math.max(0, Math.trunc(place.sheet) || 0);
      const rawBlock = place.block === null ? null : Math.trunc(place.block);
      const block = rawBlock !== null && Number.isFinite(rawBlock) && rawBlock >= 0 ? rawBlock : null;
      const start = block !== null && place.start ? blockStart(place.start) : null;
      const savedAt = new Date().toISOString();
      await db.query(
        `insert into bookmarks (reader_id, item_id, sheet, block, block_start, saved_at) values ($1, $2, $3, $4, $5, $6)
         on conflict (reader_id, item_id) do update
         set sheet = excluded.sheet, block = excluded.block, block_start = excluded.block_start, saved_at = excluded.saved_at`,
        [readerId, itemId, sheet, block, start, savedAt],
      );
      return { readerId, itemId, sheet, block, start, savedAt };
    },
    async removeItem(itemId) {
      if (!itemId) return;
      await db.query("delete from bookmarks where item_id = $1", [itemId]);
    },
  };
}
