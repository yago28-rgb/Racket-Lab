"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import type { Colorway } from "@/types/product";

interface Props {
  url: string;
  colorway: Colorway;
  /** 0..1 — used by the comparison overlay. */
  opacity?: number;
  castShadow?: boolean;
}

/**
 * Loads a racket GLB generated in Blender (PBR materials: clear-coated paint,
 * leather grip with normal/roughness maps, woven strings) and applies the
 * runtime grip tint. Geometry is Meshopt-compressed; the decoder ships with
 * three-stdlib, so nothing is fetched from a third-party CDN.
 */
export function RacketGLB({ url, colorway, opacity = 1, castShadow = true }: Props) {
  const { scene } = useGLTF(url, false, true);
  // Each instance gets its own materials so tint/opacity never leak between canvases.
  const root = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = (m.material as THREE.Material).clone();
    });
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = castShadow;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshPhysicalMaterial;
      if (mat.name === "Grip") mat.color.set(colorway.grip);
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.depthWrite = opacity >= 1;
      mat.envMapIntensity = 1;
      mat.needsUpdate = true;
    });
  }, [root, colorway.grip, opacity, castShadow]);

  useLayoutEffect(
    () => () => {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) (m.material as THREE.Material).dispose();
      });
    },
    [root],
  );

  return <primitive object={root} />;
}

export function preloadRacket(url: string) {
  useGLTF.preload(url, false, true);
}
