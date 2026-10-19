// Builds the app icons and web manifest in public/ from the Q mark (docs/brand §6).
//
//   npm install --no-save sharp
//   node docs/brand/tools/build-icons.cjs
//
// Run from the repo root. Reads tools/q-outline.svg; writes:
//   public/apple-touch-icon.png   180, full square (iOS rounds the corners itself)
//   public/icon-192.png, -512.png the rounded app-icon tile (kit/app-icon.svg)
//   public/icon-maskable-512.png  full bleed, Q inside the 80% safe zone (Android masks it)
//   public/site.webmanifest

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "..", "..");
const out = path.join(root, "public");
const INK = "#22201B";
const MARIGOLD = "#F2B705";
const PAPER = "#F7F2DF";

const q = fs.readFileSync(path.join(__dirname, "q-outline.svg"), "utf8");
const [qx, qy, qw, qh] = q.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
const qPath = q.match(/ d="([^"]+)"/)[1];

/** Same geometry as kit/build-kit.cjs: the Q's bowl, not its tail, sits on the centre. */
function tile(size, radius, scale) {
  const s = scale * (size / qh);
  const tx = (size - qw * s) / 2 - qx * s;
  const ty = (size - qh * s) / 2 - qy * s - 0.023 * size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${MARIGOLD}"/><path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" fill="${INK}" d="${qPath}"/></svg>`;
}

const icons = [
  { file: "apple-touch-icon.png", svg: tile(180, 0, 0.72) },
  { file: "icon-192.png", svg: tile(192, 42, 0.66) },
  { file: "icon-512.png", svg: tile(512, 112, 0.66) },
  { file: "icon-maskable-512.png", svg: tile(512, 0, 0.56) },
];

const manifest = {
  name: "Quire",
  short_name: "Quire",
  description: "A personal press for one reader.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: PAPER,
  theme_color: PAPER,
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

fs.mkdirSync(out, { recursive: true });
Promise.all(
  icons.map(({ file, svg }) =>
    sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(path.join(out, file))
      .then((info) => `${file} ${info.width}×${info.height}`),
  ),
).then((lines) => {
  fs.writeFileSync(path.join(out, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log([...lines, "site.webmanifest"].join("\n"));
});
