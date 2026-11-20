/**
 * Scans public/fotos/ for product photos saved locally by the owner and writes
 * src/data/photos.generated.json ({ slug: ["/fotos/slug-1.jpg", ...] }).
 *
 * Runs automatically before `npm run dev` and `npm run build` (predev/prebuild).
 * The photos and the generated manifest are git-ignored: product photography is
 * copyrighted and stays on the owner's machine.
 *
 * Naming: <slug>-1.<ext> (main, full racket), <slug>-2.<ext>, <slug>-3.<ext> (extra angles/details).
 * Extensions: jpg, jpeg, png, webp, avif.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "fotos");
const out = path.join(process.cwd(), "src", "data", "photos.generated.json");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const manifest = {};
const pattern = /^(.+)-(\d+)$/;
for (const file of readdirSync(dir).sort()) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) continue;
  const m = pattern.exec(path.basename(file, path.extname(file)));
  if (!m) continue;
  const [, slug, n] = m;
  (manifest[slug] ??= []).push({ n: Number(n), src: `/fotos/${file}` });
}
const result = Object.fromEntries(
  Object.entries(manifest).map(([slug, list]) => [slug, list.sort((a, b) => a.n - b.n).map((x) => x.src)]),
);
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
const count = Object.values(result).reduce((n, l) => n + l.length, 0);
console.log(`[fotos] ${count} fotos de ${Object.keys(result).length} raquetas → src/data/photos.generated.json`);
