/**
 * Downloads the official product photos listed in scripts/photo-sources.json
 * into public/fotos/ (git-ignored). Run it on your own computer:
 *
 *   npm run fotos:descargar
 *
 * - Only URLs verified to exist are listed (Merchant of Tennis product pages).
 * - Existing files are kept; delete one to download it again.
 * - Photos are copyrighted by their owners: they stay on your machine and are never committed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sources = JSON.parse(readFileSync(path.join(root, "scripts", "photo-sources.json"), "utf8"));
const dir = path.join(root, "public", "fotos");
mkdirSync(dir, { recursive: true });

let ok = 0;
let skipped = 0;
const failed = [];
for (const [slug, entry] of Object.entries(sources)) {
  for (const [i, url] of entry.photos.entries()) {
    const file = path.join(dir, `${slug}-${i + 1}.jpg`);
    if (existsSync(file)) {
      skipped++;
      continue;
    }
    try {
      const res = await fetch(`${url}?width=1400`, { headers: { "User-Agent": "Mozilla/5.0 (RacketLab local photo fetch)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      ok++;
      console.log(`✓ ${path.relative(root, file)}`);
    } catch (e) {
      failed.push(`${slug}-${i + 1}: ${e.message}`);
      console.log(`✗ ${slug}-${i + 1} (${e.message})`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}
console.log(`\n${ok} descargadas · ${skipped} ya existían · ${failed.length} con error`);
if (failed.length) console.log("Reintenta más tarde o guárdalas a mano desde la ficha indicada en FOTOS.md.");
const missing = ["babolat-pure-strike-98-16x19-2024", "wilson-pro-staff-97-v14", "head-prestige-mp-2023", "tecnifibre-tf-x1-300-v2", "prince-phantom-100x-305-2024"];
console.log(`Sin fuente automática (guárdalas a mano si quieres): ${missing.join(", ")}`);
