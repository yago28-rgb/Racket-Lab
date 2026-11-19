/**
 * Exports the geometry-relevant catalogue data for the Blender generator.
 * Usage: npx tsx scripts/export-catalog.ts > scripts/blender/catalog.json
 */
import { products } from "../src/data/products";
import { maxBeam } from "../src/lib/recommendation/profile";

const studio = {
  slug: "studio",
  name: "RACKET LAB Studio",
  headSizeSqIn: 100,
  beamMm: 23,
  lengthIn: 27,
  mains: 16,
  crosses: 19,
  colorway: { frame: "#1a1a1c", accent: "#232326", grip: "#121213", strings: "#e9e7e2" },
  carbon: true,
};

const out = [
  studio,
  ...products.map((p) => ({
    slug: p.slug,
    name: `${p.brand} ${p.model} ${p.generation}`,
    headSizeSqIn: p.specs.headSizeSqIn ?? 100,
    beamMm: maxBeam(p.specs.beamMm) ?? 23,
    lengthIn: p.specs.lengthIn ?? 27,
    mains: p.specs.pattern?.mains ?? 16,
    crosses: p.specs.pattern?.crosses ?? 19,
    colorway: p.colorway,
    carbon: false,
  })),
];

process.stdout.write(JSON.stringify(out, null, 2) + "\n");
