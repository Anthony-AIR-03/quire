/**
 * Server compositor for Print this issue. Same bound plan as Read, set as
 * the Sunday Bundle (docs/brand §10): a front page, the contents, then one
 * piece per page, each opening on its marigold band. One column, ragged
 * right, no italics, Atkinson Hyperlegible Next at 12 pt. A4 or letter.
 * Not a product named Press.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import fontkitMod from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { fromSource, motto, stanceCopy, takeLabel, wordsFetched } from "../copy";
import type { BoundIssue } from "./bind";
import { composeIssue, type PagePlan } from "./compose";
import { hostnameOf } from "./kept";
import { longDate, minutesCopy, piecesCopy, readingMinutes, shortDate } from "./edition";
import { NAMEPLATE_PATH, NAMEPLATE_VIEWBOX } from "./nameplate";
import { paperBox, printPlan, type PaperName, type PrintSheet } from "./print";
import { qrMatrix } from "./qr";
import { IMAGE_MAX_BYTES, readCapped, safeFetch } from "./safe-fetch";

// Paper is the paper: the page is left white, so a print never floods the sheet with tint.
const INK = rgb(34 / 255, 32 / 255, 27 / 255);
const INK_2 = rgb(61 / 255, 58 / 255, 50 / 255);
const MUTED = rgb(92 / 255, 87 / 255, 75 / 255);
const RULE = rgb(207 / 255, 198 / 255, 170 / 255);
const MARIGOLD = rgb(242 / 255, 183 / 255, 5 / 255);
const MARIGOLD_SOFT = rgb(251 / 255, 234 / 255, 176 / 255);
const WHITE = rgb(1, 1, 1);

const MARGIN = 56;
const BODY = 12;
const BODY_LEADING = 18;

const FACES = {
  regular: new URL("../../fonts/AtkinsonHyperlegibleNext-Regular.ttf", import.meta.url),
  bold: new URL("../../fonts/AtkinsonHyperlegibleNext-Bold.ttf", import.meta.url),
  heavy: new URL("../../fonts/AtkinsonHyperlegibleNext-ExtraBold.ttf", import.meta.url),
} as const;

type Faces = {
  regular: PDFFont;
  bold: PDFFont;
  heavy: PDFFont;
};

export async function composePrint(issue: BoundIssue, paper: PaperName = "a4"): Promise<Uint8Array> {
  const page = composeIssue(issue);
  const plan = printPlan(issue);
  const doc = await PDFDocument.create();
  doc.registerFontkit(resolveFontkit() as Parameters<PDFDocument["registerFontkit"]>[0]);
  const faces = await embedFaces(doc);
  const book = openBook(doc, faces, paper);

  for (const sheet of plan.sheets) {
    if (sheet.kind === "cover") {
      drawFront(book, sheet, page, issue);
      continue;
    }
    if (sheet.kind === "contents") {
      drawContents(book, sheet);
      continue;
    }
    await drawPiece(book, sheet, page, issue);
  }

  return doc.save();
}

function resolveFontkit() {
  const raw = fontkitMod as { create?: unknown; default?: { create?: unknown } };
  if (raw && typeof raw.create === "function") return raw;
  if (raw.default && typeof raw.default.create === "function") return raw.default;
  throw new Error("fontkit has no create()");
}

async function embedFaces(doc: PDFDocument): Promise<Faces> {
  const [regular, bold, heavy] = await Promise.all([
    doc.embedFont(faceBytes(FACES.regular), { subset: true }),
    doc.embedFont(faceBytes(FACES.bold), { subset: true }),
    doc.embedFont(faceBytes(FACES.heavy), { subset: true }),
  ]);
  return { regular, bold, heavy };
}

function faceBytes(face: URL) {
  try {
    return readFileSync(fileURLToPath(face));
  } catch {
    return readFileSync(join(process.cwd(), "fonts", face.pathname.split("/").pop() ?? ""));
  }
}

type Book = {
  doc: PDFDocument;
  faces: Faces;
  size: [number, number];
  page: PDFPage;
  y: number;
  left: number;
  width: number;
  folio: string;
};

function openBook(doc: PDFDocument, faces: Faces, paper: PaperName): Book {
  const size = paperBox(paper);
  return {
    doc,
    faces,
    size,
    page: doc.addPage(size),
    y: size[1] - MARGIN,
    left: MARGIN,
    width: size[0] - MARGIN * 2,
    folio: "",
  };
}

function freshPage(book: Book, folio = book.folio) {
  book.page = book.doc.addPage(book.size);
  book.folio = folio;
  book.y = book.size[1] - MARGIN;
  if (folio) drawFolio(book);
}

function need(book: Book, height: number) {
  if (book.y - height < MARGIN + 18) freshPage(book);
}

function wrap(font: PDFFont, text: string, size: number, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    if (font.widthOfTextAtSize(word, size) <= width) {
      line = word;
      continue;
    }
    let chunk = "";
    for (const ch of word) {
      const trial = chunk + ch;
      if (font.widthOfTextAtSize(trial, size) <= width) {
        chunk = trial;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

/** Left-aligned, ragged right. Returns where the last line ended, for an end mark. */
function write(
  book: Book,
  text: string,
  font: PDFFont,
  size: number,
  leading: number,
  color = INK,
  width = book.width,
  x = book.left,
) {
  let end = { x, y: book.y };
  for (const line of wrap(font, text, size, width)) {
    need(book, leading);
    book.page.drawText(line, { x, y: book.y - size, size, font, color });
    end = { x: x + font.widthOfTextAtSize(line, size), y: book.y - size };
    book.y -= leading;
  }
  return end;
}

function fullRule(book: Book, thickness: number, color = INK) {
  book.page.drawRectangle({ x: book.left, y: book.y - thickness, width: book.width, height: thickness, color });
  book.y -= thickness;
}

/** Thick over thin, as under a newspaper's nameplate. */
function oxfordRule(book: Book) {
  fullRule(book, 2.4);
  book.y -= 2;
  fullRule(book, 0.6);
}

function drawFolio(book: Book) {
  const y = MARGIN - 24;
  book.page.drawRectangle({ x: book.left, y: y + 14, width: book.width, height: 0.6, color: RULE });
  book.page.drawText("Quire", { x: book.left, y, size: 9, font: book.faces.bold, color: MUTED });
  const label = `Page ${Number(book.folio)}`;
  book.page.drawText(label, {
    x: book.left + book.width - book.faces.regular.widthOfTextAtSize(label, 9),
    y,
    size: 9,
    font: book.faces.regular,
    color: MUTED,
  });
}

function drawNameplate(book: Book, height: number) {
  const [vx, vy, vw, vh] = NAMEPLATE_VIEWBOX.split(" ").map(Number);
  const scale = height / vh;
  const width = vw * scale;
  // drawSvgPath maps SVG y-down onto the page from the given origin.
  book.page.drawSvgPath(NAMEPLATE_PATH, {
    x: book.left + (book.width - width) / 2 - vx * scale,
    y: book.y + vy * scale,
    scale,
    color: INK,
    borderWidth: 0,
  });
  book.y -= height;
}

function drawFront(book: Book, sheet: Extract<PrintSheet, { kind: "cover" }>, page: PagePlan, issue: BoundIssue) {
  drawNameplate(book, 64);
  book.y -= 10;
  const ears = `${piecesCopy(page.sequence.length)} · ${minutesCopy(readingMinutes(page.sequence)).toLowerCase()}`;
  const earsWidth = book.faces.regular.widthOfTextAtSize(ears, 10);
  book.page.drawText(ears, {
    x: book.left + (book.width - earsWidth) / 2,
    y: book.y - 10,
    size: 10,
    font: book.faces.regular,
    color: MUTED,
  });
  book.y -= 20;
  oxfordRule(book);
  book.y -= 4;
  // The ink dateline bar: the page's one reversed element.
  const bar = 20;
  book.page.drawRectangle({ x: book.left, y: book.y - bar, width: book.width, height: bar, color: INK });
  book.page.drawText(longDate(issue.createdAt), {
    x: book.left + 8,
    y: book.y - 14,
    size: 10,
    font: book.faces.bold,
    color: WHITE,
  });
  const mottoWidth = book.faces.bold.widthOfTextAtSize(motto, 10);
  book.page.drawText(motto, {
    x: book.left + book.width - 8 - mottoWidth,
    y: book.y - 14,
    size: 10,
    font: book.faces.bold,
    color: WHITE,
  });
  book.y -= bar + 28;

  write(book, sheet.title, book.faces.heavy, 30, 36);
  const lead = page.sequence[0];
  // The source's own cover line, set once as the standfirst (never a capital-letter kicker).
  const standfirst = lead?.standfirst ?? sheet.kicker;
  if (standfirst) {
    book.y -= 4;
    write(book, standfirst, book.faces.regular, 16, 22, INK_2);
  }
  if (lead?.sourceLine) {
    book.y -= 4;
    write(book, lead.sourceLine, book.faces.regular, 10, 15, MUTED);
  }
  book.y -= 14;
  for (const paragraph of (lead?.paragraphs ?? []).slice(0, 2)) {
    write(book, paragraph, book.faces.regular, BODY, BODY_LEADING);
    book.y -= 6;
  }
  if (sheet.meta) {
    book.y -= 10;
    write(book, `Bound ${shortDate(issue.createdAt)}`, book.faces.regular, 10, 15, MUTED);
  }
}

function drawContents(book: Book, sheet: Extract<PrintSheet, { kind: "contents" }>) {
  freshPage(book, sheet.folio);
  write(book, sheet.kicker, book.faces.heavy, 24, 30);
  book.y -= 6;
  fullRule(book, 1);
  book.y -= 8;
  for (const row of sheet.rows) {
    need(book, 40);
    if (row.absent) {
      write(book, row.title, book.faces.regular, 11, 16, MUTED);
    } else {
      const titleWidth = book.width - 60;
      write(book, row.title, book.faces.bold, 13, 18, INK, titleWidth);
      if (row.stance) {
        write(book, stanceCopy(row.stance), book.faces.bold, 10, 15, row.stance === "inconclusive" ? MUTED : INK_2);
      }
      if (row.folio) {
        const label = `Page ${Number(row.folio)}`;
        book.page.drawText(label, {
          x: book.left + book.width - book.faces.regular.widthOfTextAtSize(label, 10),
          y: book.y + 4,
          size: 10,
          font: book.faces.regular,
          color: MUTED,
        });
      }
    }
    book.y -= 6;
    book.page.drawRectangle({ x: book.left, y: book.y, width: book.width, height: 0.6, color: RULE });
    book.y -= 10;
  }
}

async function drawPiece(
  book: Book,
  sheet: Extract<PrintSheet, { kind: "piece" }>,
  page: PagePlan,
  issue: BoundIssue,
) {
  freshPage(book, sheet.folio);
  const at = page.sequence.findIndex((item) => item.folio === sheet.folio);
  const planned = at >= 0 ? page.sequence[at] : undefined;
  const stance = at >= 0 ? page.contents.rows[at]?.stance : undefined;
  const host = planned ? hostnameOf(planned.url) : "";
  const source = planned?.sourceLine?.split(" · ")[0] || host;

  // The section band: the piece's own nameplate.
  const band = 22;
  book.page.drawRectangle({ x: book.left, y: book.y - band, width: book.width, height: band, color: MARIGOLD });
  book.page.drawText(`Page ${Number(sheet.folio)}`, {
    x: book.left + 8,
    y: book.y - 15,
    size: 10,
    font: book.faces.heavy,
    color: INK,
  });
  if (source) {
    const from = fromSource(source);
    book.page.drawText(from, {
      x: book.left + 8 + book.faces.heavy.widthOfTextAtSize(`Page ${Number(sheet.folio)}`, 10) + 10,
      y: book.y - 15,
      size: 10,
      font: book.faces.regular,
      color: INK,
    });
  }
  book.y -= band + 26;

  write(book, sheet.headline, book.faces.heavy, 22, 28);
  if (planned?.standfirst) {
    book.y -= 2;
    write(book, planned.standfirst, book.faces.regular, 14, 20, INK_2);
  }
  if (planned?.sourceLine) {
    book.y -= 2;
    write(book, planned.sourceLine, book.faces.regular, 10, 15, MUTED);
  }
  if (stance) write(book, stanceCopy(stance), book.faces.bold, 10, 15, INK_2);
  book.y -= 10;

  if (planned?.figure) {
    await drawFigure(book, planned.figure.url, planned.figure.caption, planned.figure.credit);
  }
  if (sheet.take) drawNote(book, sheet.take);

  const blocks = planned?.blocks?.length
    ? planned.blocks
    : sheet.paragraphs.map((text) => ({ kind: "paragraph" as const, text }));
  const lastParagraph = blocks.map((block) => block.kind).lastIndexOf("paragraph");
  // One column at a reading measure, whatever the screen's treatment (BDA: avoid newspaper columns).
  const measure = Math.min(book.width, 420);
  for (const [index, block] of blocks.entries()) {
    if (block.kind === "subhead") {
      book.y -= 10;
      write(book, block.text, book.faces.heavy, 15, 20, INK, measure);
      book.y -= 4;
      continue;
    }
    if (block.kind === "pullQuote") {
      book.y -= 6;
      need(book, 40);
      fullRule(book, 2.4);
      book.y -= 8;
      write(book, `“${block.text}”`, book.faces.bold, 14, 20, INK, measure);
      book.y -= 4;
      fullRule(book, 0.6);
      book.y -= 12;
      continue;
    }
    const end = write(book, block.text, book.faces.regular, BODY, BODY_LEADING, INK, measure);
    if (index === lastParagraph) {
      // The end mark: a small marigold square after the last word.
      book.page.drawRectangle({
        x: end.x + 4,
        y: end.y,
        width: 6,
        height: 6,
        color: MARIGOLD,
        borderColor: INK,
        borderWidth: 0.5,
      });
    }
    book.y -= 8;
  }

  if (sheet.intent.treatment === "screening" && planned?.videoUrl) drawQr(book, planned.videoUrl);
  if (planned) {
    book.y -= 10;
    need(book, 30);
    book.page.drawRectangle({ x: book.left, y: book.y, width: book.width, height: 0.6, color: RULE });
    book.y -= 10;
    write(
      book,
      `${wordsFetched(shortDate(issue.createdAt))} ${host ? `Original: ${host}` : ""}`.trim(),
      book.faces.regular,
      9,
      13,
      MUTED,
    );
  }
}

/** Quire's note: labelled, upright, in a soft marigold box, so it is never the author's words. */
function drawNote(book: Book, text: string) {
  const lines = wrap(book.faces.regular, text, 11, book.width - 24);
  const height = 16 + 16 + lines.length * 16 + 10;
  need(book, height + 10);
  book.page.drawRectangle({
    x: book.left,
    y: book.y - height,
    width: book.width,
    height,
    color: MARIGOLD_SOFT,
    borderColor: RULE,
    borderWidth: 0.6,
  });
  book.y -= 12;
  write(book, takeLabel, book.faces.bold, 10, 16, INK, book.width - 24, book.left + 12);
  for (const line of lines) {
    book.page.drawText(line, { x: book.left + 12, y: book.y - 11, size: 11, font: book.faces.regular, color: INK });
    book.y -= 16;
  }
  book.y -= 22;
}

function drawQr(book: Book, url: string) {
  const { data, size } = qrMatrix(url);
  const cell = 2.4;
  const qr = size * cell;
  need(book, qr + 16);
  book.y -= 8;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!data[y]?.[x]) continue;
      book.page.drawRectangle({
        x: book.left + x * cell,
        y: book.y - (y + 1) * cell,
        width: cell,
        height: cell,
        color: INK,
      });
    }
  }
  book.y -= qr + 12;
}

async function drawFigure(book: Book, url: string, caption?: string, credit?: string) {
  const image = await tryEmbed(book.doc, url);
  if (!image) return;
  // Whole, never cropped, and never larger than it helps.
  const maxH = 200;
  const scale = Math.min(book.width / image.width, maxH / image.height, 1);
  const w = image.width * scale;
  const h = image.height * scale;
  need(book, h + 16);
  book.page.drawImage(image, { x: book.left, y: book.y - h, width: w, height: h });
  book.y -= h + 8;
  const line = [caption, credit].filter(Boolean).join(" ");
  if (line) write(book, line, book.faces.regular, 9, 13, MUTED);
  book.y -= 10;
}

async function tryEmbed(doc: PDFDocument, url: string): Promise<PDFImage | null> {
  if (!/^https:\/\//i.test(url)) return null;
  try {
    const response = await safeFetch(url, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) return null;
    const bytes = await readCapped(response, IMAGE_MAX_BYTES);
    const kind = response.headers.get("content-type") ?? "";
    if (kind.includes("png") || bytes[0] === 0x89) return doc.embedPng(bytes);
    return doc.embedJpg(bytes);
  } catch {
    return null;
  }
}
