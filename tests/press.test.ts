import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { notStarted, pressEmpty, pressLabel, printThisIssue, readToPage } from "../src/copy";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const keep = () => readFileSync("src/routes/index.tsx", "utf8");
const css = () => readFileSync("src/styles.css", "utf8").replace(/\r\n/g, "\n");
const cover = () => keep().slice(keep().indexOf("function BoundCover"), keep().indexOf("function BindCard"));

describe("Press is the library of bound issues", () => {
  it("names the home shelf Press, on the Desk page, not a route", () => {
    expect(pressLabel).toBe("Press");
    expect(keep()).toMatch(/className="board press" id="press"/);
    expect(keep()).toMatch(/<h2 id="press-heading">\{pressLabel\}<\/h2>/);
    expect(keep()).not.toMatch(/readLine|Read the bound issue/);
    expect(walk("src/routes").some((file) => file.includes("press"))).toBe(false);
    expect(existsSync("src/routes/press.tsx")).toBe(false);
    expect(readFileSync("src/routeTree.gen.ts", "utf8")).not.toMatch(/\/press/);
  });

  it("says an empty Press plainly, not as a failure", () => {
    const press = keep().slice(keep().indexOf('className="board press"'));
    expect(pressEmpty).toMatch(/No issues bound yet/);
    expect(pressEmpty).not.toMatch(/Could not|fail/i);
    expect(press).toMatch(/className="empty-copy">\{pressEmpty\}/);
  });

  it("draws each issue as a small front page: nameplate, rule, ink date strip, lead headline", () => {
    const source = cover();
    expect(source).toMatch(/<article className="mini">/);
    expect(source).toMatch(/<Link className="open" to="\/read\/\$id" params=\{\{ id: issue\.id \}\}>/);
    expect(source).toMatch(/<Nameplate label="" \/>/);
    expect(source).toMatch(/className="mini-rule"/);
    expect(source).toMatch(/className="mini-date"/);
    expect(source).toMatch(/\{issue\.title\}/);
    expect(source).toMatch(/piecesCopy\(issue\.pieces\.length\)/);
    expect(source).not.toMatch(/paperBadgeLabel|className="include"|type="checkbox"|keptHeading|className="clip"/);
    expect(css()).toMatch(/\.mini-date \{[\s\S]*background: var\(--band-ink\)/);
  });

  it("shows how far the reader got, from their bookmark", () => {
    const source = cover();
    expect(source).toMatch(/readToPage\(Math\.min\(reached \+ 1, pages\), pages\)/);
    expect(source).toMatch(/notStarted/);
    expect(keep()).toMatch(/forReader\(await currentReaderId\(\)\)/);
    expect(readToPage(2, 5)).toBe("Read to page 2 of 5");
    expect(notStarted).toBe("Not started");
  });

  it("asks before removing an issue, with a way out", () => {
    const source = cover();
    expect(source).toMatch(/removeIssueAsk/);
    expect(source).toMatch(/choose\("return"\)/);
    expect(source).toMatch(/choose\("discard"\)/);
    expect(source).toMatch(/keepIssueLabel/);
    expect(source).not.toMatch(/printThisIssue|Print this issue|window\.print/);
    expect(printThisIssue).toBe("Print this issue");
  });

  it("keeps no flipbook or third-party reader", () => {
    const pkg = readFileSync("package.json", "utf8");
    expect(keep()).not.toMatch(/lucide-react|issuu|sonner|Trash2/i);
    expect(pkg).not.toMatch(/issuu|page-flip|stpageflip|react-pageflip|lucide/i);
  });
});
