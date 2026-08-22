import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "topvideogames.lol — the game ranking where your bid decides";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#f5f5f5",
            fontFamily: "sans-serif",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
            topvideogames<span style={{ color: "#34d399" }}>.</span>lol
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#a3a3a3" }}>
            The game ranking where your bid decides it
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}