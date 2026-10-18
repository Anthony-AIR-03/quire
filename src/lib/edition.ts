/**
 * Facts for the front page's ears and the Press: the issue number and an
 * estimated reading time. Counted from what is stored, never invented.
 */

/** Words per minute for the estimate. Slower than the usual 200–250, to suit readers with dyslexia. */
export const READING_WPM = 150;

type Dated = { id: string; createdAt: string };

/** Issue numbers count up from the first bound issue: the oldest is No. 1. */
export function issueNumber(issues: Dated[], id: string): number | null {
  const ordered = [...issues].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id),
  );
  const at = ordered.findIndex((issue) => issue.id === id);
  return at === -1 ? null : at + 1;
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Whole minutes at READING_WPM, at least one. */
export function readingMinutes(pieces: { headline: string; paragraphs: string[] }[]): number {
  const words = pieces.reduce(
    (sum, piece) => sum + wordCount(piece.headline) + piece.paragraphs.reduce((n, p) => n + wordCount(p), 0),
    0,
  );
  return Math.max(1, Math.round(words / READING_WPM));
}

export function minutesCopy(minutes: number): string {
  return minutes === 1 ? "About 1 minute of reading" : `About ${minutes} minutes of reading`;
}

export function piecesCopy(count: number): string {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

/** "Sunday 18 October 2026", as a British paper prints it (no comma). */
export function longDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const weekday = parsed.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  return `${weekday} ${shortDate(iso)}`;
}

/** The author's opening for the front page: whole sentences, about this many characters. */
export const OPENING_CHARS = 420;

/**
 * The lead's opening words for the front page, cut at a sentence end so the
 * excerpt never stops mid-thought. The full piece is one page further.
 */
export function openingParagraphs(paragraphs: string[], limit = OPENING_CHARS): string[] {
  const out: string[] = [];
  let used = 0;
  for (const paragraph of paragraphs) {
    if (used >= limit) break;
    const room = limit - used;
    if (paragraph.length <= room || out.length === 0) {
      out.push(paragraph.length <= room ? paragraph : cutAtSentence(paragraph, room));
      used += Math.min(paragraph.length, room);
      continue;
    }
    break;
  }
  return out;
}

function cutAtSentence(text: string, limit: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+["'”’)]*\s*/g) ?? [text];
  let out = "";
  for (const sentence of sentences) {
    if (out && (out + sentence).length > limit) break;
    out += sentence;
  }
  out = out.trim();
  return out.length < text.trim().length ? `${out} …` : out;
}

/** "18 October 2026". */
export function shortDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
