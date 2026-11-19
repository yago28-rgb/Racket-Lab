/**
 * Optimises the Blender GLBs for the web: dedup, weld, quantise and Meshopt
 * compression (EXT_meshopt_compression). Textures are already WebP from Blender.
 * The Meshopt decoder ships with three-stdlib, so nothing is loaded from a CDN.
 *
 * Usage: node scripts/optimize-models.mjs [dir=public/models]
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const dir = process.argv[2] ?? "public/models";
await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.decoder": MeshoptDecoder,
  "meshopt.encoder": MeshoptEncoder,
});

let before = 0;
let after = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".glb"))) {
  const file = path.join(dir, f);
  const size0 = statSync(file).size;
  const doc = await io.read(file);
  if (doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === EXTMeshoptCompression.EXTENSION_NAME)) {
    console.log(`${f} already optimised`);
    continue;
  }
  await doc.transform(dedup(), weld(), prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
  await io.write(file, doc);
  const size1 = statSync(file).size;
  before += size0;
  after += size1;
  console.log(`${f}: ${Math.round(size0 / 1024)} KB → ${Math.round(size1 / 1024)} KB`);
}
if (before) console.log(`total ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB`);
