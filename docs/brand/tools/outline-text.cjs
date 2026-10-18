// Usage: node outline-text.cjs <font.ttf> <text> <out.svg> <fontSize> [trackingEm1000]
// Converts text to one SVG path, cropped tight to the ink box (no live font needed afterwards).
const opentype = require("opentype.js");
const fs = require("fs");
const [fontFile, text, out, sizeArg, trackArg] = process.argv.slice(2);
const font = opentype.loadSync(fontFile);
const size = Number(sizeArg || 200);
const track = (Number(trackArg || 0) / 1000) * size;
let x = 0;
const parts = [];
const glyphs = font.stringToGlyphs(text);
glyphs.forEach((g, i) => {
  parts.push(g.getPath(x, size, size));
  x += (g.advanceWidth / font.unitsPerEm) * size + track;
  if (i < glyphs.length - 1) x += (font.getKerningValue(g, glyphs[i + 1]) / font.unitsPerEm) * size;
});
const path = new opentype.Path();
parts.forEach((p) => path.extend(p));
const bb = path.getBoundingBox();
const d = path.toPathData(2);
const w = (bb.x2 - bb.x1).toFixed(2), h = (bb.y2 - bb.y1).toFixed(2);
fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bb.x1.toFixed(2)} ${bb.y1.toFixed(2)} ${w} ${h}" width="${w}" height="${h}"><path d="${d}"/></svg>\n`);
console.log(out, w, h, "baseline y =", size, "cap/ascent box top =", bb.y1.toFixed(2));
