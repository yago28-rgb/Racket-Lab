"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type * as THREE from "three";
import type { Racket } from "@/types/product";
import { RacketModel } from "./RacketModel";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

function Rig({ racket, reduced }: { racket: Racket; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    // Slow oscillation that keeps the string bed facing the viewer most of the time.
    if (!reduced) g.rotation.y = 0.45 + Math.sin(state.clock.elapsedTime * 0.35) * 0.85;
    // Subtle pointer parallax, eased.
    const tx = reduced ? 0 : state.pointer.y * 0.12;
    const tz = reduced ? 0 : -state.pointer.x * 0.1;
    g.rotation.x += (tx - g.rotation.x) * 0.05;
    g.rotation.z += (tz + -0.32 - g.rotation.z) * 0.05;
  });
  return (
    <Float speed={reduced ? 0 : 1.2} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.6} floatingRange={[-0.04, 0.04]}>
      <group ref={group} rotation={[0, 0.6, -0.32]}>
        <RacketModel specs={racket.specs} colorway={racket.colorway} />
      </group>
    </Float>
  );
}

export default function HeroScene({ racket }: { racket: Racket }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>("0px");
  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.4], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}

      >
        <Studio shadowY={-1.6} />
        <Rig racket={racket} reduced={reduced} />
      </Canvas>
    </div>
  );
}
