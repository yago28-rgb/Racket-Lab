"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RacketGLB } from "./RacketGLB";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { STUDIO_MODEL } from "@/lib/media";

const studioColorway = { frame: "#1a1a1c", accent: "#232326", grip: "#2a2a2c", strings: "#e9e7e2" };

/**
 * Camera keyframes along the hero scroll (0 → 1):
 *  0.00  three-quarter product shot
 *  0.55  dolly into the string bed, frame turns face-on
 *  1.00  pull back to a low profile view of the beam
 */
const keys = [
  { p: 0, cam: new THREE.Vector3(0, 0.02, 1.32), look: new THREE.Vector3(0, 0, 0), rot: new THREE.Euler(0, 0.55, -0.38) },
  { p: 0.55, cam: new THREE.Vector3(0.02, 0.17, 0.5), look: new THREE.Vector3(0, 0.16, 0), rot: new THREE.Euler(0, 0.05, -0.05) },
  { p: 1, cam: new THREE.Vector3(-0.5, 0.02, 0.85), look: new THREE.Vector3(0, 0.05, 0), rot: new THREE.Euler(0.1, 1.15, -0.55) },
];

function sample(p: number) {
  const i = p <= keys[1].p ? 0 : 1;
  const a = keys[i];
  const b = keys[i + 1];
  const t = THREE.MathUtils.smoothstep((p - a.p) / (b.p - a.p), 0, 1);
  return {
    cam: a.cam.clone().lerp(b.cam, t),
    look: a.look.clone().lerp(b.look, t),
    rot: new THREE.Euler(
      THREE.MathUtils.lerp(a.rot.x, b.rot.x, t),
      THREE.MathUtils.lerp(a.rot.y, b.rot.y, t),
      THREE.MathUtils.lerp(a.rot.z, b.rot.z, t),
    ),
  };
}

function Rig({ progress, reduced }: { progress: MutableRefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3());
  const { camera } = useThree();
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = sample(reduced ? 0 : progress.current);
    const k = 1 - Math.exp(-delta * 6); // frame-rate independent easing
    const px = reduced ? 0 : state.pointer.x;
    const py = reduced ? 0 : state.pointer.y;
    camera.position.lerp(s.cam.clone().add(new THREE.Vector3(px * 0.06, py * 0.04, 0)), k);
    look.current.lerp(s.look, k);
    camera.lookAt(look.current);
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
    g.rotation.x += (s.rot.x + py * 0.08 - g.rotation.x) * k;
    g.rotation.y += (s.rot.y + px * 0.35 + idle - g.rotation.y) * k;
    g.rotation.z += (s.rot.z - g.rotation.z) * k;
    g.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.008;
  });
  return (
    <group ref={group}>
      <RacketGLB url={STUDIO_MODEL} colorway={studioColorway} />
    </group>
  );
}

export default function HeroScene({ progress }: { progress: MutableRefObject<number> }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>("0px");
  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.02, 1.32], fov: 34, near: 0.02, far: 20 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        shadows="percentage"
      >
        <Suspense fallback={null}>
          <Studio shadowY={-0.4} />
          <Rig progress={progress} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
