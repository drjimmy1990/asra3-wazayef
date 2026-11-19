import React from "react";
import { THEME } from "../theme";

export const V6_TOTAL_FRAMES = 2250; // 75.00s @ 30fps exact sync to v4-flagship.wav

export const PHONE = {
  W: 402,
  H: 874,
  R: 55,
  bezel: 5,
  frame: 3,
} as const;

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly r: number;
}

export const FULL_RECT: Rect = {
  x: 0,
  y: 0,
  w: PHONE.W,
  h: PHONE.H,
  r: PHONE.R,
};

export const ICON_RECT: Rect = {
  x: PHONE.W / 2 - 64,
  y: PHONE.H / 2 - 64,
  w: 128,
  h: 128,
  r: 30,
};

export const clamp = (v: number, a = 0, b = 1): number =>
  v < a ? a : v > b ? b : v;

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

export const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): ((x: number) => number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-7 || Math.abs(d) < 1e-7) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20 && Math.abs(sx(t) - x) > 1e-6; i++) {
      if (sx(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
};

export const E = {
  linear: (x: number) => x,
  inOut: cubicBezier(0.65, 0, 0.35, 1),
  smooth: cubicBezier(0.45, 0, 0.2, 1),
  out: cubicBezier(0.16, 1, 0.3, 1),
  in: cubicBezier(0.55, 0, 0.85, 0.35),
  snappy: cubicBezier(0.2, 0.9, 0.3, 1),
} as const;

export const prog = (
  t: number,
  t0: number,
  dur: number,
  ease: (x: number) => number = E.inOut
): number => ease(clamp((t - t0) / dur));

/** Closed-form damped harmonic spring from motion-designer core.js */
export const mSpring = (
  t: number,
  t0: number,
  response = 0.38,
  damping = 0.86
): number => {
  if (t <= t0) return 0;
  const dt = t - t0;
  const w0 = (2 * Math.PI) / response;
  if (damping < 1) {
    const wd = w0 * Math.sqrt(1 - damping * damping);
    const e = Math.exp(-damping * w0 * dt);
    return (
      1 - e * (Math.cos(wd * dt) + ((damping * w0) / wd) * Math.sin(wd * dt))
    );
  }
  return 1 - Math.exp(-w0 * dt) * (1 + w0 * dt);
};

export interface TrackKey {
  readonly t: number;
  readonly d?: number;
  readonly to: number;
  readonly e?: (x: number) => number;
  readonly spring?: readonly [number, number];
}

export const track = (
  t: number,
  base: number,
  keys: ReadonlyArray<TrackKey>
): number => {
  let v = base;
  let prevTo = base;
  for (const k of keys) {
    const f = k.spring
      ? mSpring(t, k.t, k.spring[0], k.spring[1])
      : prog(t, k.t, k.d ?? 0.6, k.e ?? E.inOut);
    v += (k.to - prevTo) * f;
    prevTo = k.to;
  }
  return v;
};

/** Authentic button tap depression + rebound */
export const press = (t: number, t0: number, depth = 0.94): number => {
  if (t < t0) return 1;
  return (
    1 -
    (1 - depth) * (prog(t, t0, 0.07, E.out) - mSpring(t, t0 + 0.1, 0.3, 0.72))
  );
};

export const pulse = (t: number, t0: number, dur = 0.38): number => {
  if (t < t0 || t > t0 + dur) return 0;
  return Math.sin((Math.PI * (t - t0)) / dur);
};

export const mixRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
  r: lerp(a.r, b.r, p),
});

export interface Cam {
  readonly s: number;
  readonly x: number;
  readonly y: number;
}

export interface CamShot {
  readonly t0: number;
  readonly d: number;
  readonly cam: Cam;
  readonly rest?: number;
}

/** Places phone horizontally centered at scale s with phone screen y=top at stage y=stageTop */
export const camAt = (
  stageW: number,
  s: number,
  phoneTop: number,
  stageTop = 0
): Cam => ({
  s,
  x: stageW / 2 - (PHONE.W / 2) * s,
  y: stageTop - phoneTop * s,
});

const camMix = (a: Cam, b: Cam, p: number): Cam => ({
  s: lerp(a.s, b.s, p),
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
});

/** Gentle continuous camera zoom drift during holds (0.7%/sec around visual focal center) */
const drifted = (
  c: Cam,
  since: number,
  stageW: number,
  focalY: number,
  rate = 0.007
): Cam => {
  const k = 1 + rate * Math.max(0, Math.min(since, 10));
  return {
    s: c.s * k,
    x: stageW / 2 - (stageW / 2 - c.x) * k,
    y: focalY - (focalY - c.y) * k,
  };
};

export const cameraAt = (
  shots: ReadonlyArray<CamShot>,
  t: number,
  stageW: number,
  focalY: number
): Cam => {
  let i = 0;
  while (i + 1 < shots.length && t >= shots[i + 1].t0) {
    i++;
  }
  const at = (k: number) =>
    drifted(
      shots[k].cam,
      t - (shots[k].rest ?? shots[k].t0 + shots[k].d),
      stageW,
      focalY
    );
  return i
    ? camMix(at(i - 1), at(i), prog(t, shots[i].t0, shots[i].d, E.smooth))
    : at(0);
};

/**
 * Masked editorial typography slot: text rises cleanly out of overflow-hidden mask
 * and sinks out cleanly before exits, reserving space up front so lines never jump.
 */
export const MaskedLine: React.FC<{
  readonly t: number;
  readonly enterAt: number;
  readonly exitAt?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ t, enterAt, exitAt, children, style }) => {
  const enterP = prog(t, enterAt, 0.42, E.out);
  const exitP = exitAt !== undefined ? prog(t, exitAt, 0.28, E.in) : 0;
  const yPct = (1 - enterP) * 112 - exitP * 112;
  const visible = t >= enterAt && (exitAt === undefined || t <= exitAt + 0.3);

  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: 6,
        paddingTop: 4,
      }}
    >
      <div
        style={{
          visibility: visible ? "visible" : "hidden",
          translate: `0px ${yPct.toFixed(2)}%`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Vertical mechanical digit roller from motion-designer core.js:
 * old value slides smoothly up & out while the new value rises into place.
 */
export const DigitRoller: React.FC<{
  readonly t: number;
  readonly steps: ReadonlyArray<{ readonly t: number; readonly v: string }>;
  readonly dur?: number;
  readonly height?: number;
  readonly style?: React.CSSProperties;
}> = ({ t, steps, dur = 0.34, height = 30, style }) => {
  let idx = -1;
  for (let k = 0; k < steps.length; k++) {
    if (t >= steps[k].t) idx = k;
  }
  if (idx < 0) {
    return (
      <span
        dir="ltr"
        style={{
          display: "inline-block",
          height,
          lineHeight: `${height}px`,
          fontVariantNumeric: "tabular-nums",
          ...style,
        }}
      >
        {steps[0]?.v ?? ""}
      </span>
    );
  }
  const cur = steps[idx];
  const prev = steps[idx - 1];
  const p = prog(t, cur.t, dur, E.snappy);

  return (
    <span
      dir="ltr"
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        height,
        lineHeight: `${height}px`,
        fontVariantNumeric: "tabular-nums",
        verticalAlign: "bottom",
        ...style,
      }}
    >
      <span style={{ visibility: "hidden" }}>{cur.v}</span>
      {prev && p < 1 ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            translate: `0px ${(-p * 105).toFixed(2)}%`,
            opacity: 1 - p,
          }}
        >
          {prev.v}
        </span>
      ) : null}
      <span
        style={{
          position: "absolute",
          inset: 0,
          translate: `0px ${prev && p < 1 ? ((1 - p) * 105).toFixed(2) : "0"}%`,
        }}
      >
        {cur.v}
      </span>
    </span>
  );
};

/**
 * Tactile iOS finger-tap ring marker from motion-designer:
 * appears 0.08s before tap, contracts slightly on impact, ripples and fades cleanly.
 */
export const TapMarker: React.FC<{
  readonly t: number;
  readonly tapAt: number;
  readonly x: number;
  readonly y: number;
}> = ({ t, tapAt, x, y }) => {
  const showStart = tapAt - 0.1;
  const showEnd = tapAt + 0.42;
  if (t < showStart || t > showEnd) return null;

  const pIn = prog(t, showStart, 0.1, E.out);
  const pOut = prog(t, tapAt + 0.12, 0.3, E.out);
  const impact = press(t, tapAt, 0.8);
  const ringScale = 0.65 + pOut * 1.15;
  const opacity = pIn * (1 - pOut);

  return (
    <div
      style={{
        position: "absolute",
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          border: `2.5px solid ${THEME.goldSolid}`,
          scale: `${ringScale}`,
          opacity: opacity * 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          width: 24,
          height: 24,
          borderRadius: 9999,
          backgroundColor: "rgba(212, 175, 55, 0.32)",
          border: `2px solid ${THEME.goldSolid}`,
          scale: `${impact}`,
          opacity,
        }}
      />
    </div>
  );
};
