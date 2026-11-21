import { ImageResponse } from "next/og";

export const alt = "RACKET LAB — Your game. Your racket.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(120% 80% at 50% 0%, #ffffff 0%, #f5f5f7 55%, #e8e8ea 100%)",
          color: "#111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, letterSpacing: 8, fontWeight: 600 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, border: "3px solid #111", display: "flex" }} />
          RACKET LAB
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95 }}>
          <span>YOUR GAME.</span>
          <span style={{ color: "#b0b0b5" }}>YOUR RACKET.</span>
        </div>
        <div style={{ fontSize: 30, color: "#555" }}>Find the racket that plays like you.</div>
      </div>
    ),
    size,
  );
}
