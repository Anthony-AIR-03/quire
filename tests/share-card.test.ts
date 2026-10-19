import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { shareDescription, shareImageAlt, shareTitle } from "../src/copy";
import { isOpenPath } from "../src/lib/owner";
import { OG_IMAGE } from "../src/lib/site-url";

describe("link previews", () => {
  it("ships a 1200 × 630 PNG built from the brand kit", () => {
    const png = readFileSync("public/og-image.png");
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    // IHDR width and height, big-endian, right after the signature and chunk header.
    expect(png.readUInt32BE(16)).toBe(OG_IMAGE.width);
    expect(png.readUInt32BE(20)).toBe(OG_IMAGE.height);
    expect(existsSync("docs/brand/tools/build-og.cjs")).toBe(true);
  });

  it("describes Quire on every page, with an absolute image address", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    const site = readFileSync("src/lib/site-url.ts", "utf8");
    for (const tag of ["og:title", "og:description", "og:image", "og:image:alt", "twitter:card", "twitter:image"]) {
      expect(root).toContain(`"${tag}"`);
    }
    expect(root).toContain("const image = `${origin}${OG_IMAGE.path}`;");
    expect(root).toContain('{ name: "twitter:card", content: "summary_large_image" }');
    expect(site).toContain('serverEnv("BETTER_AUTH_URL")');
    expect(site).toContain(".client(() => window.location.origin)");
    expect(shareTitle).toMatch(/^Quire/);
    expect(shareDescription.length).toBeLessThanOrEqual(200);
    expect(shareImageAlt).toMatch(/nameplate/);
  });

  it("is a static file, served before the owner gate, so previews work while signed out", () => {
    // The gate only sees page and server-function requests; files in public/ are served first.
    // The page a crawler lands on when signed out is /login, which carries the same tags.
    expect(OG_IMAGE.path.startsWith("/")).toBe(true);
    expect(isOpenPath("/login")).toBe(true);
  });
});
