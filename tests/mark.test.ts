import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("the nameplate", () => {
  it("is the outlined blackletter Quire from the brand kit, drawn in currentColor", () => {
    const mark = readFileSync("src/mark.tsx", "utf8");
    const outline = readFileSync("docs/brand/tools/nameplate-outline.svg", "utf8");
    const path = outline.match(/ d="([^"]+)"/)?.[1] ?? "";
    expect(path.length).toBeGreaterThan(100);
    expect(readFileSync("src/lib/nameplate.ts", "utf8")).toContain(path);
    expect(mark).toContain('from "./lib/nameplate"');
    expect(mark).toMatch(/fill="currentColor"/);
    expect(mark).toMatch(/role=\{label \? "img" : undefined\}/);
    expect(mark).toMatch(/aria-label=\{label \|\| undefined\}/);
    // Outlines only: no live text and no font, so the nameplate needs no blackletter face.
    expect(mark).not.toMatch(/<text|fontFamily|font-family/);
  });

  it("is the only blackletter: no blackletter face is loaded anywhere", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(css).not.toMatch(/Grenze|Unifraktur|Pirata|blackletter/i);
    expect(root).not.toMatch(/fonts\.googleapis/);
  });

  it("replaces the old Q flourish everywhere", () => {
    expect(existsSync("src/assets/quire-flourish.svg")).toBe(false);
    for (const file of ["src/routes/index.tsx", "src/routes/read.$id.tsx", "src/routes/login.tsx"]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/QuireMark|quire-mark/);
      expect(source).toMatch(/<Nameplate/);
    }
  });

  it("ships the favicon from the kit", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(existsSync("src/assets/favicon.svg")).toBe(true);
    expect(readFileSync("src/assets/favicon.svg", "utf8")).toBe(
      readFileSync("docs/brand/kit/favicon.svg", "utf8"),
    );
    expect(root).toMatch(/rel: "icon", type: "image\/svg\+xml", href: favicon/);
  });
});
