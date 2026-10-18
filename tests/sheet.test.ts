import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { composeIssue, nextSheetIndex, pieceSheetIndex, readingSheets } from "../src/lib/compose";
import type { BoundIssue } from "../src/lib/bind";
import { kicker } from "../src/copy";

const issue: BoundIssue = {
  id: "issue-1",
  createdAt: "2026-09-01T00:00:00.000Z",
  title: "The harbour vote",
  leadUrl: "https://example.com/kept",
  take: { status: "ok", text: "A quiet count in Praia." },
  pieces: [
    {
      url: "https://example.com/kept",
      role: "original",
      headline: "The harbour vote",
      paragraphs: ["The assembly met at dusk in Praia.", "The motion carried after a quiet count."],
      figure: "https://images.example/harbour.jpg",
    },
  ],
};

const read = () => readFileSync("src/routes/read.$id.tsx", "utf8");
const css = () => readFileSync("src/styles.css", "utf8").replace(/\r\n/g, "\n");

describe("Read: the Sunday Bundle", () => {
  it("opens a bound issue on its front page, then one piece per page", () => {
    const source = read();
    const page = composeIssue(issue);
    expect(readingSheets(page).map((sheet) => sheet.kind)).toEqual(["front", "piece"]);
    expect(readingSheets(page, { front: false }).map((sheet) => sheet.kind)).toEqual(["piece"]);
    expect(source).toMatch(/const front = bound;/);
    expect(source).toMatch(/readingSheets\(page, \{ front \}\)/);
    expect(source).toMatch(/isFront \? "sheet-front" : "sheet-piece"/);
    expect(source).toMatch(/<FrontPage/);
    expect(source).toMatch(/<PieceSheet/);
    expect(source.match(/<article/g)?.length).toBe(1);
    expect(source).not.toMatch(/sheets\.map\(\(sheet\) => <|className="spread"|isMobile|useMediaQuery/);
  });

  it("sets a front page with factual ears, the nameplate, a dateline and the rest of the issue", () => {
    const source = read();
    const front = source.slice(source.indexOf("function FrontPage"), source.indexOf("function pieceBlocks"));
    expect(front).toMatch(/className="ear"/);
    expect(front).toMatch(/\{issueName\}<\/strong>Bound \{shortDate\(createdAt\)\}/);
    expect(front).toMatch(/piecesCopy\(page\.sequence\.length\)/);
    expect(front).toMatch(/minutesCopy\(minutes\)/);
    expect(front).toMatch(/<Nameplate \/>/);
    expect(front).toMatch(/<OxfordRule \/>/);
    expect(front).toMatch(/className="dateline"/);
    expect(front).toMatch(/className="skyline"/);
    expect(front).toMatch(/openingParagraphs\(lead\.paragraphs\)/);
    expect(front).toMatch(/lead\.standfirst \? <p className="standfirst">/);
    expect(front).toMatch(/readFullPiece/);
    // The one reversed element on the front page is the dateline; the action is outlined.
    expect(front).toMatch(/<button type="button" className="btn" onClick=\{\(\) => onOpen\(0\)\}>/);
    expect(front).not.toMatch(/btn-primary/);
    const dateline = css().match(/\n\.dateline \{([^}]+)\}/)?.[1] ?? "";
    expect(dateline).toMatch(/background: var\(--band-ink\)/);
  });

  it("labels every front-page link with the page number it opens", () => {
    const source = read();
    const front = source.slice(source.indexOf("function FrontPage"), source.indexOf("function pieceBlocks"));
    // A link at \`at\` in the rest of the issue opens piece at + 1; the folio there reads its sheet + 1.
    expect(front.match(/onOpen\(at \+ 1\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(front.match(/pieceSheetIndex\(at \+ 1, \{ front: true \}\) \+ 1/g)?.length).toBe(2);
    expect(source).toMatch(/pieceSheetIndex\(pieceIndex, \{ front \}\)/);
    expect(source).toMatch(/pageOf\(index \+ 1, total\)/);
    expect(front).toContain("Pages 3 to ${total}");
    // With a lead and two more pieces: the second piece (rest[0]) is on page 3.
    expect(pieceSheetIndex(0 + 1, { front: true }) + 1).toBe(3);
  });

  it("opens each piece on a marigold section band, in one column, ending with an end mark", () => {
    const source = read();
    const piece = source.slice(source.indexOf("function PieceSheet"), source.indexOf("function SheetPhoto"));
    expect(piece).toMatch(/<p className="band">/);
    expect(piece).toMatch(/fromSource\(source\)/);
    expect(piece).toMatch(/<div className="article">/);
    expect(piece).toMatch(/<h1>\{sheet\.headline\}<\/h1>/);
    expect(piece).toMatch(/className="end-mark"/);
    expect(piece).toMatch(/wordsFetched\(boundOn\)/);
    expect(piece).not.toMatch(/className=\{[^}]*"drop"/);
    const band = css().match(/\n\.band \{([^}]+)\}/)?.[1] ?? "";
    expect(band).toMatch(/background: var\(--marigold\)/);
    expect(band).toMatch(/color: var\(--on-marigold\)/);
  });

  it("labels the take as Quire's note, upright, so it is never the author's words", () => {
    const source = read();
    expect(source).toMatch(/<aside className="note-box">\s*<h2>\{takeLabel\}<\/h2>/);
    expect(source).not.toMatch(/>Take</);
    expect(source).not.toMatch(/TL;DR|tl;dr/);
    expect(css()).not.toMatch(/\.take \{/);
  });

  it("never invents a cover line, standfirst, folio URL or kicker", () => {
    const page = composeIssue(issue);
    const compose = readFileSync("src/lib/compose.ts", "utf8");
    expect(kicker).toBe("A personal press");
    expect(page.cover.kicker).toBeUndefined();
    expect(page.sequence[0]?.standfirst).toBeUndefined();
    expect(JSON.stringify(page.cover)).not.toMatch(/A personal press/);
    expect(compose).not.toMatch(/import \{[^}]*\bkicker\b/);
    expect(page.sequence[0]?.folio).toMatch(/^\d+$/);
    expect(read()).not.toMatch(/Inside ·|\bPress\b|\/clips\/\$/);
  });

  it("keeps navigation inside Quire, and the source one honest link away", () => {
    const source = read();
    expect(source).toMatch(/<Link className="home" to="\/">\s*<Nameplate label="Quire, back to the Desk" \/>/);
    expect(source).not.toMatch(/window\.open|window\.print|printIssue/);
    // The only links out are the source itself, labelled with its host.
    const outbound = [...source.matchAll(/href=\{([^}]+)\}/g)].map((match) => match[1]);
    expect(new Set(outbound)).toEqual(new Set(["sheet.url"]));
    expect(source).toMatch(/target="_blank" rel="noreferrer"/);
  });

  it("turns pages with Previous / Next, the contents, the skyline and the arrow keys", () => {
    const source = read();
    const page = composeIssue(issue);
    const sheets = readingSheets(page);
    expect(source).toMatch(/<nav className="turn" aria-label="Turn the page">/);
    expect(source).toMatch(/nextSheetIndex\(index, sheets\.length\)/);
    expect(source).toMatch(/previousSheetIndex\(index, sheets\.length\)/);
    expect(source).toMatch(/pieceSheetIndex\(pieceIndex, \{ front \}\)/);
    expect(source).toMatch(/event\.key === "ArrowRight"/);
    expect(source).toMatch(/event\.key === "ArrowLeft"/);
    expect(source).toMatch(/pageOf\(index \+ 1, total\)/);
    expect(source).toMatch(/is-turning/);
    expect(source).toMatch(/window\.scrollTo\(0, 0\)/);
    expect(pieceSheetIndex(0)).toBe(1);
    expect(sheets[pieceSheetIndex(0)]?.kind).toBe("piece");
    expect(nextSheetIndex(0, sheets.length)).toBe(1);
    expect(nextSheetIndex(1, sheets.length)).toBe(1);
    const turn = css().match(/\n\.turn \{([^}]+)\}/)?.[1] ?? "";
    expect(turn).toMatch(/position: sticky/);
    expect(css()).toMatch(/\.turn button \{[\s\S]*min-height: 48px/);
  });

  it("puts the app bar outside the paper, with Contents, Reading settings and Print", () => {
    const source = read();
    expect(source.indexOf('className={isFront ? "appbar is-front" : "appbar"}')).toBeLessThan(
      source.indexOf('<div className="paper">'),
    );
    expect(source).toMatch(/contentsLabel/);
    expect(source).toMatch(/<ReadingSettingsPanel id="reading-settings" open=\{settingsOpen\} \/>/);
    expect(source).toMatch(/printThisIssue/);
    expect(source).toMatch(/aria-controls="reading-settings"/);
  });

  it("shows the ribbon where the reader stopped, and offers to continue", () => {
    const source = read();
    expect(source).toMatch(/function Resume\(/);
    expect(source).toMatch(/className="resume" role="status"/);
    expect(source).toMatch(/continueReadingLabel\(resumeAt \+ 1, total\)/);
    expect(source).toMatch(/"stopped" : undefined/);
    expect(css()).toMatch(/\.stopped::before \{[\s\S]*url\("\.\/assets\/ribbon\.svg"\)/);
  });

  it("contains photographs whole and caps their height", () => {
    const styles = css();
    const frame = styles.match(/\n\.figure-frame img \{([^}]+)\}/)?.[1] ?? "";
    expect(frame).toMatch(/object-fit: contain/);
    expect(frame).toMatch(/max-height: 26rem/);
    expect(styles).toMatch(/\.lead \.figure-frame img \{\n\s*max-height: 18rem;/);
    expect(styles).not.toMatch(/object-fit:\s*cover/);
    expect(composeIssue(issue).sequence[0]?.figure?.fit).toBe("contain");
  });

  it("keeps print and PDF libraries off the page and the flipbook out", () => {
    const source = read();
    const pkg = readFileSync("package.json", "utf8");
    expect(source).not.toMatch(/pdfjs|react-pdf|application\/pdf|iframe/i);
    expect(pkg).not.toMatch(/pdfjs|react-pdf|page-flip|stpageflip|react-pageflip|turn\.js/i);
    expect(source).not.toMatch(/lucide-react|sonner|@\/components\/ui|BindDialog/);
  });
});
