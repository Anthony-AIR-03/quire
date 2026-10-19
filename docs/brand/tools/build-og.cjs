// Builds the link-preview image (Open Graph / Twitter card): public/og-image.png, 1200 × 630.
// Every word is outlined from the real fonts, so the PNG looks the same wherever it is shown.
//
//   npm install --no-save opentype.js sharp
//   node docs/brand/tools/build-og.cjs
//
// Run from the repo root. Reads fonts/AtkinsonHyperlegibleNext-*.ttf and the nameplate outline
// in src/lib/nameplate.ts; writes public/og-image.png (and og-image.svg next to this script).

const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "..", "..");
const W = 1200;
const H = 630;

const INK = "#22201B";
const PAPER = "#F7F2DF";
const MUTED = "#5C574B";
const MARIGOLD = "#F2B705";

const face = (weight) =>
  opentype.loadSync(path.join(root, "fonts", `AtkinsonHyperlegibleNext-${weight}.ttf`));
const regular = face("Regular");
const bold = face("Bold");
const heavy = face("ExtraBold");

const nameplateSource = fs.readFileSync(path.join(root, "src", "lib", "nameplate.ts"), "utf8");
const [vx, vy, vw, vh] = nameplateSource.match(/NAMEPLATE_VIEWBOX = "([^"]+)"/)[1].split(" ").map(Number);
const nameplatePath = nameplateSource.match(/NAMEPLATE_PATH =\s*"([^"]+)"/)[1];

/** Text as one outlined path; `anchor` is "start", "middle" or "end". Tracking in em/1000. */
function text(font, value, size, x, baseline, fill, anchor = "start", tracking = 20) {
  const glyphs = font.stringToGlyphs(value);
  const track = (tracking / 1000) * size;
  let width = 0;
  glyphs.forEach((glyph, i) => {
    width += (glyph.advanceWidth / font.unitsPerEm) * size + (i < glyphs.length - 1 ? track : 0);
  });
  let pen = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const out = new opentype.Path();
  glyphs.forEach((glyph, i) => {
    out.extend(glyph.getPath(pen, baseline, size));
    pen += (glyph.advanceWidth / font.unitsPerEm) * size + track;
    if (i < glyphs.length - 1) pen += (font.getKerningValue(glyph, glyphs[i + 1]) / font.unitsPerEm) * size;
  });
  return `<path fill="${fill}" d="${out.toPathData(2)}"/>`;
}

const left = 64;
const right = W - 64;
const parts = [];

// Paper.
parts.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);

// Ears: the product's own two lines, boxed beside the nameplate as on a front page.
const ear = (x, lines) => {
  parts.push(`<rect x="${x}" y="52" width="250" height="96" fill="none" stroke="${INK}" stroke-width="1.5"/>`);
  parts.push(text(bold, lines[0], 24, x + 18, 92, INK));
  parts.push(text(regular, lines[1], 24, x + 18, 128, INK));
};
ear(left, ["Save the links.", "Bind the issue."]);
ear(right - 250, ["A personal press", "for one reader"]);

// The nameplate, centred between the ears.
const plateHeight = 124;
const scale = plateHeight / vh;
const plateWidth = vw * scale;
parts.push(
  `<path fill="${INK}" transform="translate(${((W - plateWidth) / 2 - vx * scale).toFixed(2)} ${(38 - vy * scale).toFixed(2)}) scale(${scale.toFixed(4)})" d="${nameplatePath}"/>`,
);

// Oxford rule: thick over thin.
parts.push(`<rect x="${left}" y="182" width="${right - left}" height="5" fill="${INK}"/>`);
parts.push(`<rect x="${left}" y="190" width="${right - left}" height="1.5" fill="${INK}"/>`);

// The ink dateline bar: the page's one reversed element.
parts.push(`<rect x="${left}" y="200" width="${right - left}" height="46" fill="${INK}"/>`);
parts.push(text(bold, "Read it like a Sunday paper", 22, left + 20, 231, PAPER));
parts.push(text(bold, "Set for dyslexic readers", 22, right - 20, 231, PAPER, "end"));

// The lead: what Quire does, in plain words.
parts.push(text(heavy, "Keep the articles you mean to read.", 54, left, 330, INK, "start", 0));
parts.push(text(heavy, "Bind them into your own newspaper.", 54, left, 400, INK, "start", 0));
parts.push(
  text(
    regular,
    "One reader, the authors’ own words, one calm column at a time.",
    28,
    left,
    462,
    MUTED,
  ),
);

// The marigold section band along the foot, with the end mark's square.
parts.push(`<rect x="0" y="${H - 96}" width="${W}" height="96" fill="${MARIGOLD}"/>`);
parts.push(text(heavy, "Quire", 30, left, H - 38, INK, "start", 10));
parts.push(text(regular, "Keep · Select · Create issue · Read · Print", 26, right, H - 38, INK, "end"));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>\n`;
fs.writeFileSync(path.join(__dirname, "og-image.svg"), svg);
fs.mkdirSync(path.join(root, "public"), { recursive: true });
sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, palette: true, colours: 64 })
  .toFile(path.join(root, "public", "og-image.png"))
  .then((info) => console.log(`public/og-image.png ${info.width}×${info.height}, ${info.size} bytes`));
