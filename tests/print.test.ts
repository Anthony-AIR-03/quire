import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, PageSizes } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { BoundIssue } from "../src/lib/bind";
import { composeIssue } from "../src/lib/compose";
import { composePrint } from "../src/lib/print-compose";
import { paperBox, paperNameFor, printPlan } from "../src/lib/print";
import { couldNotPrint, printThisIssue } from "../src/copy";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

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
    },
    {
      url: "https://news.example/one",
      role: "related",
      headline: "A second dispatch",
      paragraphs: ["Another reporter stood on the quay."],
    },
  ],
};

describe("Print this issue", () => {
  it("uses the user-facing name Print this issue, not Press and not PDF", () => {
    const read = readFileSync("src/routes/read.$id.tsx", "utf8");
    const keep = readFileSync("src/routes/index.tsx", "utf8");
    expect(printThisIssue).toBe("Print this issue");
    expect(printThisIssue).not.toMatch(/Press|PDF/);
    expect(couldNotPrint).not.toMatch(/Press|PDF/);
    expect(read).toMatch(/printThisIssue/);
    expect(read).toMatch(/\{printThisIssue\}/);
    expect(read).not.toMatch(/\bPress\b/);
    expect(read).not.toMatch(/>PDF</);
    expect(keep).not.toMatch(/printThisIssue|Print this issue/);
    expect(keep).toMatch(/className="board press"/);
    expect(keep).not.toMatch(/to=["']\/press["']/);
  });

  it("does not ship a /press route; Press stays the home library", () => {
    const routes = walk("src/routes");
    const src = walk("src")
      .filter((file) => !file.endsWith(".ttf"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(routes.some((file) => file.includes("press"))).toBe(false);
    expect(existsSync("src/routes/press.tsx")).toBe(false);
    expect(src.includes("/press")).toBe(false);
    expect(readFileSync("src/routeTree.gen.ts", "utf8")).not.toMatch(/\/press/);
    expect(readFileSync("src/routes/index.tsx", "utf8")).toMatch(/className="board press"/);
  });

  it("prints the bound sequence, original words, and the same Design Intent", () => {
    const page = composeIssue(issue);
    const plan = printPlan(issue);
    expect(plan.papers).toEqual(["a4", "letter"]);
    expect(plan.intent).toEqual(page.intent);
    expect(plan.sheets.map((sheet) => sheet.kind)).toEqual(["cover", "contents", "piece", "piece"]);
    expect(plan.sheets[0]).toMatchObject({
      kind: "cover",
      masthead: "Quire",
      title: "The harbour vote",
    });
    expect(plan.sheets[0] && "kicker" in plan.sheets[0] ? plan.sheets[0].kicker : undefined).toBeUndefined();
    const contents = plan.sheets[1];
    expect(contents?.kind).toBe("contents");
    if (contents?.kind === "contents") {
      expect(contents.kicker).toBe("In this issue");
      expect(contents.folio).toBe("02");
      expect(contents.rows.map((row) => row.folio)).toEqual(["03", "04"]);
    }
    const lead = plan.sheets[2];
    expect(lead?.kind).toBe("piece");
    if (lead?.kind === "piece") {
      expect(lead.paragraphs.join(" ")).toMatch(/assembly met at dusk/);
      expect(lead.take).toBe("A quiet count in Praia.");
      expect(lead.intent).toEqual(page.sequence[0]?.intent);
      expect(lead.folio).toBe("03");
    }
    const related = plan.sheets[3];
    expect(related?.kind).toBe("piece");
    if (related?.kind === "piece") {
      expect(related.paragraphs.join(" ")).toMatch(/Another reporter/);
      expect(related.take).toBeUndefined();
      expect(related.folio).toBe("04");
    }
    expect(JSON.stringify(plan)).not.toMatch(/Inside ·/);
    expect(JSON.stringify(plan)).not.toMatch(/A personal press/);
    expect(JSON.stringify(plan)).not.toMatch(/\bPress\b/);
  });

  it("prints an ok take as Quire's note, labelled and upright, never italic", async () => {
    const plan = printPlan(issue);
    const lead = plan.sheets.find((sheet) => sheet.kind === "piece");
    expect(lead?.kind).toBe("piece");
    if (lead?.kind === "piece") {
      expect(lead.take).toBe("A quiet count in Praia.");
    }
    const compositor = readFileSync("src/lib/print-compose.ts", "utf8");
    expect(compositor).toMatch(/if \(sheet\.take\) drawNote\(book, sheet\.take\)/);
    expect(compositor).toMatch(/write\(book, takeLabel,/);
    expect(compositor).not.toMatch(/serifIt|Italic|["']Take["']/);
    expect(compositor).not.toMatch(/TL;DR|tl;dr/);

    const missing = printPlan({ ...issue, take: null });
    const bare = missing.sheets.find((sheet) => sheet.kind === "piece");
    expect(bare?.kind).toBe("piece");
    if (bare?.kind === "piece") {
      expect(bare.take).toBeUndefined();
      expect(bare.paragraphs.join(" ")).toMatch(/assembly met at dusk/);
    }
  });
  it("composes A4 and letter in the brand's ink, marigold and one family", async () => {
    expect(paperNameFor("en-GB")).toBe("a4");
    expect(paperNameFor("nl-NL")).toBe("a4");
    expect(paperNameFor("en-US")).toBe("letter");
    expect(paperBox("a4")).toEqual(PageSizes.A4);
    expect(paperBox("letter")).toEqual(PageSizes.Letter);

    const a4 = await composePrint(issue, "a4");
    const letter = await composePrint(issue, "letter");
    const a4Doc = await PDFDocument.load(a4);
    const letterDoc = await PDFDocument.load(letter);
    expect(a4Doc.getPageCount()).toBeGreaterThanOrEqual(3);
    expect(letterDoc.getPageCount()).toBeGreaterThanOrEqual(3);
    expect(a4Doc.getPage(0).getSize()).toEqual({ width: PageSizes.A4[0], height: PageSizes.A4[1] });
    expect(letterDoc.getPage(0).getSize()).toEqual({
      width: PageSizes.Letter[0],
      height: PageSizes.Letter[1],
    });

    const compositor = readFileSync("src/lib/print-compose.ts", "utf8");
    expect(compositor).toMatch(/34 \/ 255,\s*32 \/ 255,\s*27 \/ 255/);
    expect(compositor).toMatch(/242 \/ 255,\s*183 \/ 255,\s*5 \/ 255/);
    expect(compositor).toMatch(/AtkinsonHyperlegibleNext-Regular\.ttf/);
    expect(compositor).toMatch(/AtkinsonHyperlegibleNext-Bold\.ttf/);
    expect(compositor).toMatch(/AtkinsonHyperlegibleNext-ExtraBold\.ttf/);
    expect(compositor).toMatch(/drawSvgPath\(NAMEPLATE_PATH/);
    expect(compositor).not.toMatch(/StandardFonts|Helvetica|Source(?:Sans|Serif)|Playfair|Fraunces|Inter["']/);
    expect(compositor).not.toMatch(/toUpperCase/);
    // One column at a reading measure: no newspaper columns in print either.
    expect(compositor).not.toMatch(/body_flow === "two"|colWidth/);
    expect(existsSync("fonts/AtkinsonHyperlegibleNext-Regular.ttf")).toBe(true);
    expect(existsSync("fonts/SourceSerif4-Regular.ttf")).toBe(false);
  });
  it("keeps the compositor off the client Read module", () => {
    const read = readFileSync("src/routes/read.$id.tsx", "utf8");
    const helpers = readFileSync("src/lib/print.ts", "utf8");
    expect(read).not.toMatch(/print-compose|node:fs|pdf-lib|fontkit/);
    expect(helpers).not.toMatch(/node:fs|pdf-lib|fontkit|readFileSync/);
    expect(read).toMatch(/composeBoundPrint/);
    expect(read).toMatch(/from "\.\.\/lib\/print-bound"/);
  });

  it("sits in the app bar, outside the paper, as a quiet button", () => {
    const read = readFileSync("src/routes/read.$id.tsx", "utf8");
    const bar = read.indexOf('className={isFront ? "appbar is-front" : "appbar"}');
    const printAt = read.indexOf('className="link-btn print"');
    const paperAt = read.indexOf('<div className="paper">');
    expect(bar).toBeGreaterThan(-1);
    expect(printAt).toBeGreaterThan(bar);
    expect(printAt).toBeLessThan(paperAt);
    expect(read).toMatch(/printThisIssue/);
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toMatch(/\.link-btn \{[\s\S]*background: none/);
  });
  it("keeps Print off the Desk and adds no flipbook export", () => {
    const keep = readFileSync("src/routes/index.tsx", "utf8");
    const pkg = readFileSync("package.json", "utf8");
    expect(keep).toMatch(/className="keep"/);
    expect(keep).toMatch(/createIssueLabel/);
    expect(keep).not.toMatch(/printThisIssue|className="stage"/);
    expect(pkg).toMatch(/"pdf-lib"/);
    expect(pkg).not.toMatch(/pdfjs|react-pdf|page-flip|stpageflip|react-pageflip|issuu/i);
    expect(keep).not.toMatch(/getClipIntelligenceState|\/reliability/);
    const save = readFileSync("src/lib/save.ts", "utf8");
    expect(save).toMatch(/store\.insert\(/);
    expect(save).toMatch(/persistUnderstanding/);
    expect(save).toMatch(/persistRelated/);
    expect(save).toMatch(/persistSourceHeadline/);
  });
});
