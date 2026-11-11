import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          borderRadius: "38px",
          border: "3px solid #27272A",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 900,
            color: "#FAFAFA",
            letterSpacing: "-2px",
          }}
        >
          <span>A</span>
          <span style={{ color: "#D4AF37" }}>3</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 30,
            width: 13,
            height: 13,
            borderRadius: "999px",
            backgroundColor: "#D4AF37",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
