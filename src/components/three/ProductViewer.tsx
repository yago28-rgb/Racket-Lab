"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import type { Racket } from "@/types/product";
import { RacketGLB } from "./RacketGLB";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { modelSrc } from "@/lib/media";

/** Interactive product viewer: drag to orbit, wheel/pinch to zoom into the string bed. */
export default function ProductViewer({ racket }: { racket: Racket }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="h-full w-full touch-none" role="img" aria-label="Visor 3D interactivo: arrastra para girar, rueda o pellizca para hacer zoom">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0.35, 0.1, 1.15], fov: 36, near: 0.01, far: 20 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        shadows="percentage"
      >
        <Suspense fallback={null}>
          <Studio shadowY={-0.38} />
          <group rotation={[0, 0.45, -0.2]}>
            <RacketGLB url={modelSrc(racket.slug)} colorway={racket.colorway} />
          </group>
        </Suspense>
        <OrbitControls enablePan={false} minDistance={0.28} maxDistance={2.2} autoRotate={!reduced} autoRotateSpeed={0.7} enableDamping makeDefault />
      </Canvas>
    </div>
  );
}
