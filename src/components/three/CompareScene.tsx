"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import type { Racket } from "@/types/product";
import { RacketGLB } from "./RacketGLB";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { modelSrc } from "@/lib/media";

/** Places one racket, easing between side-by-side and overlaid positions. */
function Slot({ racket, x, overlay, index }: { racket: Racket; x: number; overlay: boolean; index: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!g.current) return;
    const k = 1 - Math.exp(-delta * 5);
    g.current.position.x += ((overlay ? 0 : x) - g.current.position.x) * k;
    g.current.position.z += ((overlay ? index * 0.012 : 0) - g.current.position.z) * k;
  });
  return (
    <group ref={g} position={[x, 0, 0]}>
      <RacketGLB url={modelSrc(racket.slug)} colorway={racket.colorway} opacity={overlay && index > 0 ? 0.55 : 1} />
    </group>
  );
}

/** All models share the same scale (metres), so head sizes compare truthfully. */
export default function CompareScene({ rackets, overlay }: { rackets: Racket[]; overlay: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const gap = 0.3;
  const offset = ((rackets.length - 1) * gap) / 2;
  return (
    <div ref={ref} className="h-full w-full touch-pan-y" role="img" aria-label="Comparación 3D a escala real de las raquetas seleccionadas">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.02, 1.35], fov: 38, near: 0.01, far: 20 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        shadows="percentage"
      >
        <Suspense fallback={null}>
          <Studio dark shadowY={-0.38} />
          {rackets.map((r, i) => (
            <Slot key={r.id} racket={r} index={i} x={i * gap - offset} overlay={overlay} />
          ))}
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2 - 0.5} maxPolarAngle={Math.PI / 2 + 0.3} minAzimuthAngle={-0.8} maxAzimuthAngle={0.8} enableDamping />
      </Canvas>
    </div>
  );
}
