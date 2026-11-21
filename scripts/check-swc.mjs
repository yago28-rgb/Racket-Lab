/**
 * Diagnóstico del binario nativo de Next.js (SWC) en Windows.
 * Uso:  node scripts/check-swc.mjs
 * Solo lee archivos: no borra ni modifica nada.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

// Valores de referencia del paquete publicado @next/swc-win32-x64-msvc@16.4.6
const EXPECTED = {
  version: "16.4.6",
  size: 110267392,
  sha256: "d56048f1d21f0a307b93f024a5f1eaf2f7011669a12cb736714b1d2070033aca",
};

const ok = (m) => console.log(`  OK    ${m}`);
const bad = (m) => console.log(`  FALLO ${m}`);
const info = (m) => console.log(`  ·     ${m}`);

console.log("\n1. Sistema");
info(`Node ${process.version} · plataforma ${process.platform} · arquitectura de Node ${process.arch}`);
info(`Arquitectura del procesador (Windows): ${process.env.PROCESSOR_ARCHITECTURE ?? "?"} ${process.env.PROCESSOR_ARCHITEW6432 ?? ""}`.trim());
info(`CPU: ${os.cpus()[0]?.model ?? "?"}`);
if (process.platform !== "win32") info("Este diagnóstico está pensado para Windows.");
if (process.arch !== "x64") bad(`Node no es x64 (${process.arch}). El paquete instalado es para x64.`);
else ok("Node es x64");

console.log("\n2. Paquete instalado");
const pkgDir = path.join(process.cwd(), "node_modules", "@next", "swc-win32-x64-msvc");
const bin = path.join(pkgDir, "next-swc.win32-x64-msvc.node");
if (!existsSync(pkgDir)) {
  bad("No existe node_modules/@next/swc-win32-x64-msvc → npm no lo instaló.");
} else {
  const v = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8")).version;
  if (v === EXPECTED.version) ok(`Versión ${v}`);
  else bad(`Versión ${v}, se esperaba ${EXPECTED.version} (restos de una instalación anterior)`);
  const nextV = JSON.parse(readFileSync(path.join(process.cwd(), "node_modules", "next", "package.json"), "utf8")).version;
  if (nextV === EXPECTED.version) ok(`next ${nextV}`);
  else bad(`next ${nextV}, se esperaba ${EXPECTED.version}`);

  if (!existsSync(bin)) {
    bad("Falta el archivo .node (posible cuarentena del antivirus).");
  } else {
    const size = statSync(bin).size;
    if (size === EXPECTED.size) ok(`Tamaño ${size} bytes`);
    else bad(`Tamaño ${size} bytes, se esperaban ${EXPECTED.size} → archivo incompleto o alterado`);
    const buf = readFileSync(bin);
    if (buf.subarray(0, 2).toString() === "MZ") ok("Cabecera de ejecutable Windows (MZ)");
    else bad("No empieza por MZ → no es un ejecutable válido");
    const hash = createHash("sha256").update(buf).digest("hex");
    if (hash === EXPECTED.sha256) ok("Huella SHA-256 idéntica al paquete oficial");
    else bad(`Huella SHA-256 distinta: ${hash}`);

    console.log("\n3. Carga del módulo");
    try {
      createRequire(import.meta.url)(bin);
      ok("El binario se carga correctamente");
    } catch (e) {
      bad(`No se puede cargar: ${e.message.split("\n")[0]}`);
    }
  }
}

console.log(`
Interpretación:
- Tamaño o huella distintos      → descarga corrupta o antivirus. Ver README, «Solución de problemas».
- Versión distinta               → restos de otra instalación en node_modules.
- Node no es x64 / CPU ARM       → instala Node para tu arquitectura.
- Todo OK pero no carga          → falta el runtime de Visual C++ (ver README).
`);
