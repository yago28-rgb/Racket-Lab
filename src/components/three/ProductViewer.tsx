"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import type { Racket } from "@/types/product";
import { RacketModel } from "./RacketModel";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

/** Loads a licensed GLB model when one is configured (`/public/models/<slug>.glb`). */
function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ProductViewer({ racket, glbUrl }: { racket: Racket; glbUrl?: string }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="h-full w-full touch-none" role="img" aria-label="Visor 3D interactivo: arrastra para girar, rueda o pellizca para hacer zoom">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 3.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}

      >
        <Studio shadowY={-1.5} />
        <Suspense fallback={null}>
          <group rotation={[0, 0.5, -0.25]}>
            {glbUrl ? <GlbModel url={glbUrl} /> : <RacketModel specs={racket.specs} colorway={racket.colorway} />}
          </group>
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.4}
          maxDistance={5}
          autoRotate={!reduced}
          autoRotateSpeed={0.8}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
