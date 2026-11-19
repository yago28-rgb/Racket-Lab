"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RacketGLB } from "./RacketGLB";
import { Studio } from "./Studio";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { modelSrc, STUDIO_MODEL } from "@/lib/media";
import type { Colorway } from "@/types/product";
import { getRacketBySlug } from "@/lib/catalog";

const compare97 = getRacketBySlug("wilson-pro-staff-97-v14")!;

export type TechChapterId = "frame" | "pattern" | "weight" | "head" | "balance" | "swingweight" | "materials";

const studio: Colorway = { frame: "#1a1a1c", accent: "#232326", grip: "#2a2a2c", strings: "#e9e7e2" };

interface Shot {
  cam: [number, number, number];
  look: [number, number, number];
  rot: [number, number, number];
  pos?: [number, number, number];
}

/** Racket length 0.686 m centred on the origin; balance point 320 mm from the butt → 23 mm below centre. */
const BAL_OFFSET = 0.343 - 0.32;
const PIVOT_Y = -0.343 + 0.1; // swingweight axis: 10 cm from the butt

const shots: Record<TechChapterId, Shot> = {
  frame: { cam: [0.07, 0.2, 0.42], look: [0, 0.15, 0], rot: [0, 1.5, 0] },
  pattern: { cam: [0.02, 0.17, 0.34], look: [0, 0.165, 0], rot: [0, 0.12, 0] },
  weight: { cam: [0, 0.02, 1.3], look: [0, 0, 0], rot: [0, 0, -0.32] },
  head: { cam: [0, 0.02, 1.62], look: [0, 0, 0], rot: [0, 0, 0], pos: [0.21, 0, 0] },
  balance: { cam: [0.08, 0.62, 1.22], look: [0, -0.03, 0], rot: [0, 0, 0] },
  swingweight: { cam: [0, -0.02, 1.45], look: [0, -0.02, 0], rot: [0, 0, 0] },
  materials: { cam: [0.27, 0.19, 0.1], look: [0.135, 0.166, 0], rot: [0, 0, 0] },
};

/** Brushed-steel knife-edge fulcrum. */
function Fulcrum() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.045, -0.07);
    s.lineTo(0.045, -0.07);
    s.lineTo(0.004, 0);
    s.lineTo(-0.004, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 3 });
    g.translate(0, 0, -0.06);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial color="#b9bcc2" metalness={1} roughness={0.28} clearcoat={0.4} />
    </mesh>
  );
}

function Rig({ active, reduced }: { active: MutableRefObject<TechChapterId>; reduced: boolean }) {
  const { camera } = useThree();
  const main = useRef<THREE.Group>(null);
  const balanceRig = useRef<THREE.Group>(null);
  const swingRig = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const fulcrum = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const flatQ = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2))),
    [],
  );

  useFrame((state, delta) => {
    const id = active.current;
    const s = shots[id];
    const k = 1 - Math.exp(-delta * 3.2);
    const t = state.clock.elapsedTime;
    camera.position.lerp(new THREE.Vector3(...s.cam).add(new THREE.Vector3(state.pointer.x * 0.03, state.pointer.y * 0.02, 0)), k);
    look.current.lerp(new THREE.Vector3(...s.look), k);
    camera.lookAt(look.current);

    const m = main.current!;
    // Orientation
    if (id === "balance") {
      tmpQ.copy(flatQ);
    } else {
      const spin = id === "weight" && !reduced ? t * 0.5 : 0;
      tmpQ.setFromEuler(new THREE.Euler(s.rot[0], s.rot[1] + spin, s.rot[2]));
    }
    m.quaternion.slerp(tmpQ, k);
    const target = new THREE.Vector3(...(s.pos ?? [0, 0, 0]));
    if (id === "balance") target.set(BAL_OFFSET, 0.0115, 0);
    if (id === "swingweight") target.set(0, -PIVOT_Y, 0);
    m.position.lerp(target, k);

    // Balance see-saw and swingweight pendulum act on parent rigs
    const tilt = id === "balance" && !reduced ? Math.sin(t * 1.4) * 0.035 : 0;
    balanceRig.current!.rotation.z += (tilt - balanceRig.current!.rotation.z) * k;
    const swing = id === "swingweight" && !reduced ? Math.sin(t * 1.1) * 0.55 : 0;
    swingRig.current!.rotation.z += (swing - swingRig.current!.rotation.z) * k;
    swingRig.current!.position.y += ((id === "swingweight" ? PIVOT_Y : 0) - swingRig.current!.position.y) * k;

    const show = (g: THREE.Group | null, on: boolean) => {
      if (!g) return;
      const v = THREE.MathUtils.lerp(g.scale.x, on ? 1 : 0.0001, k);
      g.scale.setScalar(v);
      g.visible = v > 0.01;
    };
    show(second.current, id === "head");
    show(fulcrum.current, id === "balance");
  });

  return (
    <>
      <group ref={swingRig}>
        <group ref={balanceRig}>
          <group ref={main}>
            <RacketGLB url={STUDIO_MODEL} colorway={studio} />
          </group>
        </group>
      </group>
      <group ref={second} position={[-0.21, 0, 0]} scale={0.0001}>
        <RacketGLB url={modelSrc(compare97.slug)} colorway={compare97.colorway} />
      </group>
      <group ref={fulcrum} position={[0, -0.0115, 0]} scale={0.0001}>
        <Fulcrum />
      </group>
    </>
  );
}

export default function TechScene({ active }: { active: MutableRefObject<TechChapterId> }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>("100px");
  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.6]}
        camera={{ position: [0.34, 0.2, 0.36], fov: 36, near: 0.01, far: 20 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        shadows="percentage"
      >
        <Suspense fallback={null}>
          <Studio dark shadowY={-0.39} envIntensity={0.9} contact={false} />
          <Rig active={active} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
