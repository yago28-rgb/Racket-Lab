/**
 * Converts Blender PNG renders (with alpha) into web WebP files.
 * Usage: node scripts/convert-renders.mjs <renders-dir>
 * Output: public/products/<slug>-<view>.webp
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/convert-renders.mjs <renders-dir>");
  process.exit(1);
}
const out = path.join(process.cwd(), "public", "products");
mkdirSync(out, { recursive: true });

let total = 0;
for (const f of readdirSync(src).filter((f) => f.endsWith(".png"))) {
  const dest = path.join(out, f.replace(/\.png$/, ".webp"));
  await sharp(path.join(src, f)).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile(dest);
  total += statSync(dest).size;
  console.log(path.relative(process.cwd(), dest), Math.round(statSync(dest).size / 1024), "KB");
}
console.log(`total ${Math.round(total / 1024)} KB`);
