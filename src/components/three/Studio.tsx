"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { HDRI } from "@/lib/media";

/**
 * Photographic studio lighting: Poly Haven "Studio Small 09" HDRI (CC0, served
 * locally) for reflections and ambient light, plus a shadow-casting key light
 * and soft contact shadows.
 */
export function Studio({
  shadowY = -0.36,
  dark = false,
  envIntensity = 1,
  contact = true,
}: {
  shadowY?: number;
  dark?: boolean;
  envIntensity?: number;
  contact?: boolean;
}) {
  return (
    <>
      <Environment files={HDRI} environmentIntensity={envIntensity * (dark ? 0.7 : 1)} />
      <directionalLight
        position={[1.2, 2.2, 1.6]}
        intensity={dark ? 1.4 : 1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-near={0.5}
        shadow-camera-far={6}
        shadow-camera-left={-0.6}
        shadow-camera-right={0.6}
        shadow-camera-top={0.6}
        shadow-camera-bottom={-0.6}
      />
      <directionalLight position={[-1.5, 0.8, -1.2]} intensity={dark ? 0.9 : 0.4} color="#dfe9ff" />
      {contact && (
        <ContactShadows position={[0, shadowY, 0]} opacity={dark ? 0.55 : 0.32} scale={1.6} blur={2.8} far={0.8} resolution={512} />
      )}
    </>
  );
}
