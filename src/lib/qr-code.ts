// ==============================================================================
// ASRA3.COM — Branded High-ECC Vector QR Code Generator (Zero-Font SVG)
// Uses pure SVG geometry (no <text> fonts) so both browsers AND Satori/resvg
// inside Docker render the centered gold "A3" emblem crisply with 0 crashes.
// ==============================================================================

import QRCode from "qrcode";

/**
 * Generates a pure-vector SVG QR code (Error Correction Level H = 30%)
 * with a centered Asra3 carbon-black & gold "A3" monogram emblem.
 */
export function buildBrandedQrSvg(url: string, pixelSize = 180): string {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const count = modules.size;
  const margin = 3;
  const viewSize = count + margin * 2;

  // Center badge occupies ~22% of module count (safely within 30% Level-H budget)
  const badgeHalf = Math.max(2.6, count * 0.115);
  const center = count / 2;

  let pathData = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!modules.get(row, col)) continue;
      // Leave quiet square around centered A3 emblem
      if (
        Math.abs(row + 0.5 - center) < badgeHalf &&
        Math.abs(col + 0.5 - center) < badgeHalf
      ) {
        continue;
      }
      const x = col + margin;
      const y = row + margin;
      pathData += `M${x},${y}h1v1h-1z`;
    }
  }

  const badgeSize = badgeHalf * 2;
  const badgeOrigin = margin + center - badgeHalf;
  const badgeRadius = badgeSize * 0.22;
  const strokeW = Math.max(0.35, badgeSize * 0.055);

  // Geometric "A3" monogram drawn inside a normalized 24x24 box scaled to the badge
  const pad = badgeSize * 0.18;
  const innerSize = badgeSize - pad * 2;
  const innerX = badgeOrigin + pad;
  const innerY = badgeOrigin + pad;
  const scale = innerSize / 24;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges">
  <rect width="${viewSize}" height="${viewSize}" rx="2.4" fill="#FFFFFF"/>
  <path d="${pathData}" fill="#09090B"/>
  <rect x="${badgeOrigin.toFixed(2)}" y="${badgeOrigin.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${badgeRadius.toFixed(2)}" fill="#09090B" stroke="#D4AF37" stroke-width="${strokeW.toFixed(2)}" shape-rendering="geometricPrecision"/>
  <g transform="translate(${innerX.toFixed(2)},${innerY.toFixed(2)}) scale(${scale.toFixed(4)})" fill="none" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
    <path d="M2.5 19.5L6.8 4.5L11.1 19.5M4.1 14.2H9.5" stroke="#FAFAFA" stroke-width="2.4"/>
    <path d="M14.2 6.2C14.8 4.9 16.2 4.3 18 4.3C20.2 4.3 21.6 5.6 21.6 7.5C21.6 9.3 20.3 10.6 18.2 11.1C20.6 11.5 22 13 22 15.1C22 17.6 20 19.5 17.5 19.5C15.5 19.5 14.1 18.6 13.5 17.2" stroke="#D4AF37" stroke-width="2.4"/>
  </g>
</svg>`;
}

/**
 * Returns a Base64 data URI suitable for Satori <img src={...} /> and HTML <img>.
 */
export function buildBrandedQrDataUri(url: string, pixelSize = 180): string {
  const svg = buildBrandedQrSvg(url, pixelSize);
  const b64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
