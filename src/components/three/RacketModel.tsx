"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Colorway, RacketSpecs } from "@/types/product";
import { maxBeam } from "@/lib/recommendation/profile";
import { hoopOutline, racketDims, stringLines, throatHole, throatOutline, type Pt } from "@/lib/racket-geometry";

/** Scene units: 1 unit = 10 inches. A 27" racket is 2.7 units tall, centred on the origin. */
const S = 0.1;

function shapeFrom(pts: Pt[], hole?: Pt[]) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * S, y * S)));
  if (hole) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x * S, y * S))));
  return shape;
}

function extrude(shape: THREE.Shape, depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.18,
    bevelSize: 0.006,
    bevelSegments: 4,
    curveSegments: 4,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

interface Props {
  specs: Pick<RacketSpecs, "headSizeSqIn" | "beamMm" | "pattern" | "lengthIn">;
  colorway: Colorway;
}

/**
 * Procedural racket built from the frame's real head size, beam and string
 * pattern. It is a parametric representation, not a scanned manufacturer model:
 * the GLB slot in `ProductViewer` takes precedence when a licensed model exists.
 */
export function RacketModel({ specs, colorway }: Props) {
  const d = useMemo(
    () => racketDims(specs.headSizeSqIn ?? 100, maxBeam(specs.beamMm) ?? 23, specs.lengthIn ?? 27),
    [specs.headSizeSqIn, specs.beamMm, specs.lengthIn],
  );
  const depth = d.depth * S;

  const geo = useMemo(() => {
    const hoop = extrude(shapeFrom(hoopOutline(d)), depth);
    const throat = extrude(shapeFrom(throatOutline(d), throatHole(d)), depth * 0.92);
    const handleLen = (d.handleTop - 0.2) * S;
    const handle = new THREE.CylinderGeometry(d.handleHalfWidth * S * 0.92, d.handleHalfWidth * S, handleLen, 8, 1);
    handle.rotateY(Math.PI / 8);
    handle.translate(0, (0.2 * S) + handleLen / 2, 0);
    const cap = new THREE.CylinderGeometry(d.handleHalfWidth * S * 1.12, d.handleHalfWidth * S * 1.05, 0.04, 8);
    cap.rotateY(Math.PI / 8);
    cap.translate(0, 0.02, 0);
    const collar = new THREE.CylinderGeometry(d.handleHalfWidth * S * 1.02, d.handleHalfWidth * S * 1.02, 0.03, 8);
    collar.rotateY(Math.PI / 8);
    collar.translate(0, d.handleTop * S - 0.015, 0);
    return { hoop, throat, handle, cap, collar };
  }, [d, depth]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
    },
    [geo],
  );

  // Strings: one instanced mesh for mains + crosses.
  const lines = useMemo(() => {
    const { mains, crosses } = stringLines(d, specs.pattern?.mains ?? 16, specs.pattern?.crosses ?? 19);
    return [...mains, ...crosses];
  }, [d, specs.pattern?.mains, specs.pattern?.crosses]);
  const strings = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = strings.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    lines.forEach((l, i) => {
      const a = new THREE.Vector3(l.from[0] * S, l.from[1] * S, 0);
      const b = new THREE.Vector3(l.to[0] * S, l.to[1] * S, 0);
      const dir = b.clone().sub(a);
      const len = dir.length();
      q.setFromUnitVectors(up, dir.normalize());
      m.compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, len, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [lines]);

  const stringGeo = useMemo(() => new THREE.CylinderGeometry(0.0028, 0.0028, 1, 5, 1), []);
  useEffect(() => () => stringGeo.dispose(), [stringGeo]);

  return (
    <group position={[0, -(d.length * S) / 2, 0]}>
      <mesh geometry={geo.hoop}>
        <meshPhysicalMaterial color={colorway.frame} roughness={0.32} metalness={0.15} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh geometry={geo.throat}>
        <meshPhysicalMaterial color={colorway.accent} roughness={0.35} metalness={0.15} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh geometry={geo.handle}>
        <meshStandardMaterial color={colorway.grip} roughness={0.85} />
      </mesh>
      <mesh geometry={geo.cap}>
        <meshStandardMaterial color={colorway.grip} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh geometry={geo.collar}>
        <meshStandardMaterial color={colorway.accent} roughness={0.4} />
      </mesh>
      <instancedMesh ref={strings} args={[stringGeo, undefined, lines.length]}>
        <meshStandardMaterial color={colorway.strings} roughness={0.55} />
      </instancedMesh>
    </group>
  );
}
