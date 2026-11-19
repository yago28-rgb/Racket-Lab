"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Studio lighting built from in-scene light formers: no HDR file is downloaded,
 * so the scene renders offline and adds nothing to the network waterfall.
 */
export function Studio({ shadowY = -1.45, dark = false }: { shadowY?: number; dark?: boolean }) {
  return (
    <>
      <ambientLight intensity={dark ? 0.25 : 0.5} />
      <directionalLight position={[3, 5, 4]} intensity={dark ? 1.6 : 1.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#cfe3ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, -6]} scale={4} />
      </Environment>
      <ContactShadows position={[0, shadowY, 0]} opacity={dark ? 0.6 : 0.35} scale={6} blur={2.6} far={3} resolution={512} />
    </>
  );
}
