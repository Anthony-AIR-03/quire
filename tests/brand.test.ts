import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  issueNumber,
  longDate,
  minutesCopy,
  openingParagraphs,
  piecesCopy,
  readingMinutes,
  READING_WPM,
} from "../src/lib/edition";
import { READING_SETTINGS_SCRIPT, SIZES, SPACINGS, TINTS } from "../src/reading-settings";

const css = readFileSync("src/styles.css", "utf8").replace(/\r\n/g, "\n");

function rule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]+)\\}`))?.[1] ?? "";
}

describe("Sunday Bundle tokens (docs/brand)", () => {
  it("keeps the approved palette, with marigold as a fill only", () => {
    expect(css).toMatch(/--ink: #22201b;/);
    expect(css).toMatch(/--paper: #f7f2df;/);
    expect(css).toMatch(/--marigold: #f2b705;/);
    expect(css).toMatch(/--link: #1d4f91;/);
    expect(css).toMatch(/--muted: #5c574b;/);
    // Marigold is 1.6:1 on paper: it never colours text.
    expect(css).not.toMatch(/(?:^|[;{\s])color:\s*var\(--marigold\)/);
    // No red, green or pink anywhere (BDA).
    expect(css).not.toMatch(/\b(?:red|green|pink|crimson|tomato)\b/i);
  });

  it("self-hosts one family, Atkinson Hyperlegible Next, and loads nothing from Google", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(css).toMatch(/--font: "Atkinson Hyperlegible Next"/);
    expect(css).toMatch(/src: url\("\.\/assets\/fonts\/atkinson-hyperlegible-next-latin\.woff2"\)/);
    expect(existsSync("src/assets/fonts/atkinson-hyperlegible-next-latin.woff2")).toBe(true);
    expect(existsSync("src/assets/fonts/atkinson-hyperlegible-next-latin-ext.woff2")).toBe(true);
    expect(root).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(css).not.toMatch(/Source Serif|Source Sans|--font-serif|--font-sans/);
  });

  it("has five type sizes and nothing smaller than 16px", () => {
    const sizes = [...css.matchAll(/--fs-(display|headline|sub|body|small):/g)].map((match) => match[1]);
    expect(new Set(sizes)).toEqual(new Set(["display", "headline", "sub", "body", "small"]));
    expect(css).toMatch(/--fs-body: 1\.1875rem;/);
    expect(css).toMatch(/--fs-small: 1rem;/);
    const fixed = [...css.matchAll(/font-size:\s*([\d.]+)(px|rem)/g)].map(([, value, unit]) =>
      unit === "px" ? Number(value) : Number(value) * 16,
    );
    expect(Math.min(...fixed)).toBeGreaterThanOrEqual(16);
  });
});

describe("dyslexia rules (BDA Dyslexia Style Guide 2023)", () => {
  it("never sets italics, and turns the source's italics into bold", () => {
    expect(css).not.toMatch(/font-style:\s*italic/);
    expect(css).toMatch(/em,\ni,\ncite,\nblockquote \{\n\s*font-style: normal;/);
    expect(rule("em,\ni")).toMatch(/font-weight: 700/);
  });

  it("never justifies, hyphenates, or sets capital-letter labels", () => {
    expect(css).not.toMatch(/text-align:\s*justify/);
    expect(css).not.toMatch(/text-transform:\s*uppercase/);
    expect(rule("body")).toMatch(/hyphens: none/);
  });

  it("sets body line height 1.6, open spacing, and a 64-character measure", () => {
    expect(css).toMatch(/--lead: 1\.6;/);
    expect(css).toMatch(/--track: 0\.02em;/);
    expect(css).toMatch(/--word: 0\.08em;/);
    expect(css).toMatch(/--measure: 64ch;/);
    expect(rule(".article")).toMatch(/max-width: var\(--measure\)/);
    expect(css).not.toMatch(/column-count|(?:^|[;{\s])columns:/);
  });

  it("offers WCAG 1.4.12 spacing, four sizes and six papers, saved per device", () => {
    expect(css).toMatch(
      /\[data-spacing="wide"\] \{\n\s*--track: 0\.12em;\n\s*--word: 0\.16em;\n\s*--lead: 2;\n\s*--para: 2em;/,
    );
    expect(TINTS.map((tint) => tint.value)).toEqual(["newsprint", "cream", "yellow", "blue", "grey", "night"]);
    expect(SIZES.map((size) => size.value)).toEqual(["s", "m", "l", "xl"]);
    expect(SPACINGS.map((spacing) => spacing.value)).toEqual(["standard", "wide"]);
    for (const tint of ["cream", "yellow", "blue", "grey", "night"]) {
      expect(css).toContain(`[data-tint="${tint}"] {`);
    }
    // Applied before paint, and never breaks when storage is refused.
    expect(READING_SETTINGS_SCRIPT).toMatch(/try\{/);
    expect(READING_SETTINGS_SCRIPT).toMatch(/localStorage\.getItem\("quire-reading"\)/);
    expect(readFileSync("src/routes/__root.tsx", "utf8")).toMatch(/__html: READING_SETTINGS_SCRIPT/);
  });

  it("follows the device's dark setting until the reader picks a paper", () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\n\s*:root:not\(\[data-tint\]\) \{/);
  });

  it("keeps links underlined and set clear of the letters, and a visible focus ring", () => {
    expect(rule("a")).toMatch(/text-decoration-line: underline/);
    expect(rule("a")).toMatch(/text-underline-offset: 0\.28em/);
    expect(rule(":focus-visible")).toMatch(/outline: 3px solid var\(--focus\)/);
  });

  it("fades between pages and moves nothing when motion is reduced", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*\.sheet\.is-turning \{[\s\S]*opacity: 0/);
    expect(css).not.toMatch(/rotateY|perspective|page-curl|translateX\(-5%\)/);
  });
});

describe("edition facts", () => {
  const issues = [
    { id: "b", createdAt: "2026-10-11T08:00:00.000Z" },
    { id: "c", createdAt: "2026-10-18T08:00:00.000Z" },
    { id: "a", createdAt: "2026-10-04T08:00:00.000Z" },
  ];

  it("numbers issues from the first one bound", () => {
    expect(issueNumber(issues, "a")).toBe(1);
    expect(issueNumber(issues, "b")).toBe(2);
    expect(issueNumber(issues, "c")).toBe(3);
    expect(issueNumber(issues, "missing")).toBeNull();
  });

  it("estimates reading time at a dyslexia-friendly pace, never less than a minute", () => {
    expect(READING_WPM).toBe(150);
    const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
    expect(readingMinutes([{ headline: "", paragraphs: [words(1500)] }])).toBe(10);
    expect(readingMinutes([{ headline: "Short", paragraphs: ["A line."] }])).toBe(1);
    expect(minutesCopy(1)).toBe("About 1 minute of reading");
    expect(minutesCopy(19)).toBe("About 19 minutes of reading");
    expect(piecesCopy(1)).toBe("1 piece");
    expect(piecesCopy(4)).toBe("4 pieces");
  });

  it("prints the date as a British paper does", () => {
    expect(longDate("2026-10-18T09:00:00.000Z")).toBe("Sunday 18 October 2026");
    expect(longDate("not a date")).toBe("");
  });

  it("cuts the front-page opening at a sentence, never mid-thought", () => {
    const long = "The drawers have not moved in sixty years. ".repeat(20).trim();
    const [opening] = openingParagraphs([long]);
    expect(opening?.endsWith("years. …")).toBe(true);
    expect(opening!.length).toBeLessThan(long.length);
    expect(openingParagraphs(["One.", "Two."])).toEqual(["One.", "Two."]);
  });
});
