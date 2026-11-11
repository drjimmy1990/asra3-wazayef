import { ImageResponse } from "next/og";

export const alt =
  "Asra3.com | أسرع — Direct GCC CV Distribution & Verified HR Outreach";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 74px",
          backgroundColor: "#09090B",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
          border: "2px solid #27272A",
        }}
      >
        {/* Top Row: Pure Black + Solid Gold Brand Lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "10px 24px",
              borderRadius: "10px",
              backgroundColor: "#141417",
              border: "1.5px solid #27272A",
            }}
          >
            <span
              style={{
                fontSize: 23,
                fontWeight: 800,
                color: "#FAFAFA",
                letterSpacing: "3px",
              }}
            >
              ASRA
              <span style={{ color: "#D4AF37" }}>3</span>
              .COM
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "10px",
              backgroundColor: "#141417",
              border: "1px solid #27272A",
              color: "#D4AF37",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "0.4px",
            }}
          >
            <span>2,700+ Verified GCC HR Inboxes</span>
          </div>
        </div>

        {/* Center Hero Value Proposition */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              color: "#FAFAFA",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Get Hired&nbsp;</span>
            <span style={{ color: "#D4AF37" }}>3x Faster</span>
            <span>&nbsp;Across the Gulf.</span>
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.48,
              color: "#A1A1AA",
              fontWeight: 400,
            }}
          >
            ATS CV parsing, bespoke executive cover letters & direct placement
            into verified HR decision-maker inboxes.
          </div>
        </div>

        {/* Footer Markets Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "28px",
            borderTop: "1px solid #27272A",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#E4E4E7",
            }}
          >
            <span>UAE</span>
            <span style={{ color: "#D4AF37" }}>•</span>
            <span>SAUDI ARABIA</span>
            <span style={{ color: "#D4AF37" }}>•</span>
            <span>QATAR</span>
            <span style={{ color: "#D4AF37" }}>•</span>
            <span>KUWAIT</span>
          </div>

          <div
            style={{
              padding: "13px 28px",
              borderRadius: "10px",
              backgroundColor: "#D4AF37",
              color: "#09090B",
              fontSize: 21,
              fontWeight: 800,
            }}
          >
            Start Campaign →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
