import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chosenCount, chosenDetail, deskCount, keepLinkHint, keepLinkLabel } from "../src/copy";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const keep = () => readFileSync("src/routes/index.tsx", "utf8");
const css = () => readFileSync("src/styles.css", "utf8").replace(/\r\n/g, "\n");
const home = () => keep().slice(keep().indexOf("function Home"), keep().indexOf("function BoundCover"));

describe("home desk composition", () => {
  it("runs top to bottom: masthead, Keep a link, your Desk, the Press, and the bind bar", () => {
    const source = home();
    const order = [
      'className="masthead site"',
      'className="keep"',
      'className="board" id="desk"',
      'className="board press" id="press"',
      'className="bindbar"',
    ].map((marker) => source.indexOf(marker));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("labels the Keep box in plain words, not a bare placeholder", () => {
    const source = home();
    expect(keepLinkLabel).toBe("Keep a link");
    expect(keepLinkHint).toMatch(/Paste the address of an article/);
    expect(source).toMatch(/<label htmlFor="url">\{keepLinkLabel\}<\/label>/);
    expect(source).toMatch(/aria-describedby="url-hint"/);
    expect(source).toMatch(/keeping \? "Keeping…" : "Keep"/);
    expect(source).not.toMatch(/Keep Piece|Paste link here|aria-label="URL"/i);
  });

  it("keeps the masthead nav on this page: Desk, Press, Reading settings, Sign out", () => {
    const source = home();
    const nav = source.slice(source.indexOf('className="desk-nav"'), source.indexOf("</nav>"));
    expect(nav).toMatch(/href="#desk" aria-current="page"/);
    expect(nav).toMatch(/href="#press"/);
    expect(nav).toMatch(/readingSettingsLabel/);
    expect(nav).toMatch(/signOutLabel/);
    expect(keep()).not.toMatch(/to=["']\/press["']/);
    expect(walk("src/routes").some((file) => file.includes("press"))).toBe(false);
    expect(existsSync("src/routes/press.tsx")).toBe(false);
  });

  it("counts the chosen pieces in the bind bar, with Create issue as the page's one ink button", () => {
    const source = home();
    expect(source).toMatch(/chosenCount\(chosen\.length\)/);
    expect(source).toMatch(/chosenDetail\(keptChosen, chosen\.length - keptChosen\)/);
    expect(source.match(/btn btn-primary/g)?.length).toBe(1);
    expect(source).toMatch(/className="btn btn-primary"[\s\S]{0,300}createIssueLabel/);
    expect(chosenCount(1)).toBe("1 piece chosen");
    expect(chosenCount(4)).toBe("4 pieces chosen");
    expect(chosenDetail(1, 3)).toBe("1 kept piece and 3 more on this topic");
    expect(chosenDetail(2, 0)).toBe("2 kept pieces");
    expect(deskCount(0)).toBe("Nothing on your Desk");
    expect(css()).toMatch(/\n\.bindbar \{\n\s*position: sticky;/);
  });

  it("lays clippings two across on a wide screen and one across on a phone", () => {
    const styles = css();
    expect(styles).toMatch(/\n\.cards \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(styles).toMatch(/@media \(max-width: 899px\) \{\n\s*\.cards \{\n\s*grid-template-columns: 1fr;/);
  });

  it("does not ship mock copy or invented issues", () => {
    const source = keep();
    const copy = readFileSync("src/copy.ts", "utf8");
    expect(source).not.toMatch(/Keep Piece|Create New Issue|Select Board|items pending|Issue 04|12 PCS|Winter 2024/i);
    expect(copy).not.toMatch(/Keep Piece|Create New Issue|Select Board|items pending/i);
    expect(source).not.toMatch(/lucide-react|issuu|sonner|Trash2|Playfair|Inter["']/i);
  });
});
