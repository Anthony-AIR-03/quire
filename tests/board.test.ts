import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const keep = () => readFileSync("src/routes/index.tsx", "utf8");
const css = () => readFileSync("src/styles.css", "utf8").replace(/\r\n/g, "\n");
const card = () => keep().slice(keep().indexOf("function BindCard"), keep().indexOf("function UnderstandingFail"));

describe("Desk: clippings on newsprint", () => {
  it("heads each clipping with the stored source headline, opening Read on that keep", () => {
    const source = card();
    expect(source).toMatch(/keptHeading\(clip\)/);
    expect(source).toMatch(/<Link to="\/read\/\$id" params=\{\{ id: clip\.id \}\}>/);
    expect(source).toMatch(/\{heading\}/);
    expect(source).not.toMatch(/href=\{clip\.url\}>\s*\{heading/);
    expect(css()).toMatch(/\.clip h3 \{\n\s*font-size: var\(--fs-body\);/);
  });

  it("lets a stored figure lead the clipping, whole, and never invents one", () => {
    const source = card();
    expect(source).toMatch(/keptFigure\(clip\.sourceHeadline\)/);
    expect(source.indexOf('className="thumb"')).toBeLessThan(source.indexOf("<h3>"));
    expect(source).not.toMatch(/fetchOg|ogImage|unsplash|picsum|placeholder/i);
    const thumb = css().match(/\n\.clip \.thumb img \{([^}]+)\}/)?.[1] ?? "";
    expect(thumb).toMatch(/object-fit: contain/);
    expect(thumb).toMatch(/max-height: 12rem/);
  });

  it("puts the snippet under the headline and the paper mark in the meta line, not as a label above", () => {
    const source = card();
    expect(source).toMatch(/keptSnippet\(clip\.sourceHeadline\)/);
    expect(source.indexOf("<h3>")).toBeLessThan(source.indexOf('className="snippet"'));
    expect(source).toMatch(/paperBadgeLabel\(clip\.understanding\)/);
    expect(source).toMatch(/const secondary = \[kind, host, date/);
    expect(source).not.toMatch(/className="badge"|data-mark/);
    expect(keep()).not.toMatch(/\bCOMMENT\b|>Comment</);
  });

  it("uses a real checkbox labelled In the issue, and marks a chosen clipping with a marigold band", () => {
    const source = card();
    expect(source).toMatch(/<label className="tick" htmlFor=\{checkboxId\}>/);
    expect(source).toMatch(/type="checkbox"\s*checked=\{choice\.includeOriginal\}/);
    expect(source).toMatch(/\{inLabel\}/);
    expect(source).toMatch(/choice\.includeOriginal \? "clip is-in" : "clip"/);
    expect(css()).toMatch(/\.clip\.is-in::before \{\n\s*background: var\(--marigold\);/);
    expect(css()).toMatch(/\.tick input:checked \{\n\s*background: var\(--marigold\);/);
  });

  it("keeps Source as the one leaving control, and Remove on each clipping", () => {
    const source = card();
    expect(source).toMatch(/<a className="source" href=\{clip\.url\} target="_blank" rel="noreferrer">/);
    expect(source).toMatch(/\{sourceLabel\}/);
    expect(source).toMatch(/removeLabel/);
    expect(keep()).toMatch(/removeKept\(\{ data: \{ id: clip\.id \} \}\)\.then\(\(\) => router\.invalidate\(\)\)/);
  });

  it("says every state in words with a drawn icon, never by colour alone", () => {
    const source = keep();
    expect(source).toMatch(/keepProgressCopy\[progress\]/);
    expect(source).toMatch(/<Icon name=\{progress === "stalled" \? "alert" : "wait"\} \/>/);
    expect(source).toMatch(/headlineSpoken\.kind === "fail" \? <Icon name="alert" \/> : null/);
    expect(source).toMatch(/couldNotUnderstand/);
    expect(css()).toMatch(/\.status\.fail \{\n\s*font-weight: 700;/);
  });

  it("keeps More on this topic collapsed, with its heading and tally always visible", () => {
    const source = keep();
    expect(source).toMatch(/moreOnThisTopic/);
    expect(source).toMatch(/className="tally"/);
    expect(source).toMatch(/relatedCollapsed\(pages, selected\)/);
    expect(source).toMatch(/relatedVisible\(pages, selected\)/);
    expect(source).toMatch(/const \[open, setOpen\] = useState\(false\)/);
    expect(source).toMatch(/aria-expanded=\{open\}/);
    expect(source).toMatch(/hidden=\{!open\}/);
    expect(source).not.toMatch(/href=\{page\.url\}/);
    expect(source).not.toMatch(/to="\/read\/\$id" params=\{\{ id: page/);
  });

  it("shows Create issue working, refuses an empty selection, and fails out loud", () => {
    const source = keep();
    expect(source).toMatch(/const \[binding, setBinding\] = useState\(false\)/);
    expect(source).toMatch(/if \(binding\) return;/);
    expect(source).toMatch(/disabled=\{binding\}/);
    expect(source).toMatch(/aria-busy=\{binding\}/);
    expect(source).toMatch(/Creating…/);
    expect(source).toMatch(/finally\(\(\) => setBinding\(false\)\)/);
    expect(source).toMatch(/setBindError\(nothingSelected\)/);
    expect(source).toMatch(/role="alert"/);
    expect(source.match(/createIssueLabel/g)?.length).toBe(2);
  });

  it("keeps Print, the dark stage and the floating sheet off the Desk", () => {
    const source = keep();
    expect(source).not.toMatch(/printThisIssue|Print this issue|window\.print/);
    expect(source).not.toMatch(/className="stage"|className="sheet"/);
    expect(css()).not.toMatch(/\.stage \{|--binding/);
  });
});
