// Rebuilds every SVG in ../kit from the outlined nameplate and the geometry below.
// node tools/build-kit.cjs   (run from the quire-brand folder or tools/)
const fs = require("fs");
const path = require("path");
const here = __dirname;
const kit = path.join(here, "..", "kit");
fs.mkdirSync(kit, { recursive: true });

const INK = "#22201B";
const PAPER = "#F7F2DF";
const MARIGOLD = "#F2B705";

function readOutline(file) {
  const s = fs.readFileSync(path.join(here, file), "utf8");
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const d = s.match(/ d="([^"]+)"/)[1];
  return { x: vb[0], y: vb[1], w: vb[2], h: vb[3], d };
}
const word = readOutline("nameplate-outline.svg");
const q = readOutline("q-outline.svg");
const write = (name, body) => fs.writeFileSync(path.join(kit, name), body + "\n");

// Nameplate: the outlined word alone, tight box.
function nameplate(fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${word.x} ${word.y} ${word.w} ${word.h}" role="img" aria-label="Quire"><path fill="${fill}" d="${word.d}"/></svg>`;
}
write("nameplate.svg", nameplate(INK));
write("nameplate-paper.svg", nameplate(PAPER));

// Masthead lockup: nameplate centred between Oxford rules (thick over thin above, thin under thick below).
// Unit u = nameplate height / 10. Thick rule = 0.5u, thin = 0.15u, gap between pair = 0.3u, clear space to type = 1.2u.
function masthead(fg, bg) {
  const u = word.h / 10;
  const width = word.w + 8 * u;
  const thick = 0.5 * u, thin = 0.15 * u, gap = 0.3 * u, clear = 1.2 * u;
  const top = 0;
  const wordTop = thick + gap + thin + clear;
  const bottomRules = wordTop + word.h + clear;
  const H = bottomRules + thin + gap + thick;
  const tx = (width - word.w) / 2 - word.x;
  const ty = wordTop - word.y;
  const r = (y, h) => `<rect x="0" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${h.toFixed(2)}" fill="${fg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${H.toFixed(2)}" role="img" aria-label="Quire">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ""}${r(top, thick)}${r(thick + gap, thin)}<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)})" fill="${fg}" d="${word.d}"/>${r(bottomRules, thin)}${r(bottomRules + thin + gap, thick)}</svg>`;
}
write("masthead.svg", masthead(INK));
write("masthead-night.svg", masthead(PAPER, INK));

// The Q mark: blackletter Q on a marigold square. 256 grid, Q optically centred (its tail hangs low,
// so the bowl, not the box, is centred: lift 6 units).
function qMark(size, radius, scale, bg, fg) {
  const s = scale * (size / q.h);
  const tx = (size - q.w * s) / 2 - q.x * s;
  const ty = (size - q.h * s) / 2 - q.y * s - 0.023 * size;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Quire"><rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/><path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" fill="${fg}" d="${q.d}"/></svg>`;
}
write("mark.svg", qMark(256, 0, 0.78, MARIGOLD, INK));
write("app-icon.svg", qMark(256, 56, 0.66, MARIGOLD, INK));
write("mark-ink.svg", qMark(256, 0, 0.78, INK, MARIGOLD));

// Favicon: same mark, larger Q so it survives 16 px; square corners read as a news bill.
write("favicon.svg", qMark(64, 6, 0.9, MARIGOLD, INK));

// Ribbon: the "where you stopped" marker. 24 x 64, V-notch at the foot (notch depth = 1/3 width).
write("ribbon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64" aria-hidden="true"><path fill="${MARIGOLD}" d="M0 0H24V64L12 56L0 64Z"/></svg>`);

// Oxford rule as a repeatable strip (thick over thin), for CSS border-image or plain use.
write("oxford-rule.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" preserveAspectRatio="none"><rect width="8" height="4" fill="${INK}"/><rect y="6" width="8" height="1" fill="${INK}"/></svg>`);

console.log(fs.readdirSync(kit).join("\n"));
