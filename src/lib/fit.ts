/**
 * Pure garment-fitting geometry. No React, no DOM.
 * Takes MediaPipe pose landmarks (normalized 0..1) and returns four body
 * anchor points in pixels that the garment's anchor rectangle maps onto.
 */
import type { Garment } from "./garments";

export interface Pt {
  x: number;
  y: number;
}

export interface Landmark {
  x: number;
  y: number;
  visibility?: number | undefined;
}

export interface FitAdjust {
  /** Overall size multiplier (1 = auto) */
  scale: number;
  /** Vertical nudge in shoulder-widths (positive = down) */
  offsetY: number;
}

export interface BodyQuad {
  /** Garment anchor top-left (viewer's left) */
  tl: Pt;
  tr: Pt;
  bl: Pt;
  br: Pt;
}

export const LM = {
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_HIP: 23,
  R_HIP: 24,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
} as const;

/** Tuning constants — how clothing sits relative to joints. */
export const FIT = {
  VIS: 0.5,
  SHOULDER_SPREAD: 1.1, // seam sits a little outside the shoulder joint
  SHOULDER_LIFT: 0.05, // seam sits on top of the shoulder (× shoulder width)
  TORSO_FROM_SHOULDERS: 1.35, // estimated shoulder→hip distance when hips are hidden
  HIP_BODY_HALF: 0.8, // body half-width at hips (× hip-joint distance)
  HIP_MIN_HALF: 0.45, // ...but never narrower than this (× shoulder width)
  WAIST_HALF: 1.0, // trouser waistband half-width (× hip-joint distance)
  WAIST_LIFT: 0.35, // waistband above hip joints (× hip-joint distance)
  LEG_LENGTH: 4.8, // hip→ankle when legs are hidden (× hip-joint distance)
  KNEE_LENGTH: 2.4,
  HEM_EXTRA_HALF: 0.35,
} as const;

const vis = (l?: Landmark) => !!l && (l.visibility ?? 1) >= FIT.VIS;
const px = (l: Landmark | undefined, w: number, h: number): Pt => ({ x: (l?.x ?? 0) * w, y: (l?.y ?? 0) * h });
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const add = (a: Pt, b: Pt, k = 1): Pt => ({ x: a.x + b.x * k, y: a.y + b.y * k });

function axis(from: Pt, to: Pt): { a: Pt; n: Pt; len: number } {
  const len = dist(from, to) || 1;
  const a = { x: (to.x - from.x) / len, y: (to.y - from.y) / len };
  // perpendicular pointing "down" the body when a points to the viewer's right
  const n = { x: -a.y, y: a.x };
  return { a, n, len };
}

function scaleAbout(q: BodyQuad, c: Pt, s: number, offset: Pt): BodyQuad {
  const f = (p: Pt): Pt => ({ x: c.x + (p.x - c.x) * s + offset.x, y: c.y + (p.y - c.y) * s + offset.y });
  return { tl: f(q.tl), tr: f(q.tr), bl: f(q.bl), br: f(q.br) };
}

/**
 * Returns where the garment's anchor rectangle should land on the body, in
 * source pixels, or null when the needed joints are not visible.
 */
export function fitGarment(
  lms: Landmark[] | undefined,
  garment: Pick<Garment, "kind" | "hemAt">,
  w: number,
  h: number,
  adjust: FitAdjust = { scale: 1, offsetY: 0 },
): BodyQuad | null {
  if (!lms || lms.length < 29) return null;
  const ls = lms[LM.L_SHOULDER];
  const rs = lms[LM.R_SHOULDER];
  const lh = lms[LM.L_HIP];
  const rh = lms[LM.R_HIP];
  const shouldersOk = vis(ls) && vis(rs);
  const hipsOk = vis(lh) && vis(rh);

  // Person faces the camera: their right side appears on the viewer's left.
  const S_L = px(rs, w, h);
  const S_R = px(ls, w, h);
  const sh = axis(S_L, S_R);

  if (garment.kind === "top" || garment.kind === "long") {
    if (!shouldersOk || sh.len < 12) return null;
    const sMid = mid(S_L, S_R);
    let hMid: Pt;
    let hAxis = sh.a;
    let hw: number;
    if (hipsOk) {
      const H_L = px(rh, w, h);
      const H_R = px(lh, w, h);
      hMid = mid(H_L, H_R);
      const ha = axis(H_L, H_R);
      hAxis = ha.a;
      hw = ha.len;
    } else {
      hMid = add(sMid, sh.n, sh.len * FIT.TORSO_FROM_SHOULDERS);
      hw = sh.len * 0.75;
    }
    const topHalf = (sh.len / 2) * FIT.SHOULDER_SPREAD;
    const lift = { x: -sh.n.x * sh.len * FIT.SHOULDER_LIFT, y: -sh.n.y * sh.len * FIT.SHOULDER_LIFT };
    const botHalf = Math.max(hw * FIT.HIP_BODY_HALF, sh.len * FIT.HIP_MIN_HALF);
    const q: BodyQuad = {
      tl: add(add(sMid, sh.a, -topHalf), lift),
      tr: add(add(sMid, sh.a, topHalf), lift),
      bl: add(hMid, hAxis, -botHalf),
      br: add(hMid, hAxis, botHalf),
    };
    return scaleAbout(q, sMid, adjust.scale, { x: 0, y: adjust.offsetY * sh.len });
  }

  // bottoms
  let H_L: Pt;
  let H_R: Pt;
  if (hipsOk) {
    H_L = px(rh, w, h);
    H_R = px(lh, w, h);
  } else if (shouldersOk && sh.len >= 12) {
    const est = add(mid(S_L, S_R), sh.n, sh.len * FIT.TORSO_FROM_SHOULDERS);
    H_L = add(est, sh.a, -sh.len * 0.37);
    H_R = add(est, sh.a, sh.len * 0.37);
  } else {
    return null;
  }
  const hp = axis(H_L, H_R);
  if (hp.len < 6) return null;
  const hMid = mid(H_L, H_R);
  const waistHalf = hp.len * FIT.WAIST_HALF;
  const waistLift = hp.len * FIT.WAIST_LIFT;

  const knee = garment.hemAt === "knee";
  const lj = lms[knee ? LM.L_KNEE : LM.L_ANKLE];
  const rj = lms[knee ? LM.R_KNEE : LM.R_ANKLE];
  let hemL: Pt;
  let hemR: Pt;
  if (vis(lj) && vis(rj)) {
    hemL = px(rj, w, h);
    hemR = px(lj, w, h);
  } else if (!knee && vis(lms[LM.L_KNEE]) && vis(lms[LM.R_KNEE])) {
    // ankle ≈ hip + 2 × (knee − hip)
    const kL = px(lms[LM.R_KNEE], w, h);
    const kR = px(lms[LM.L_KNEE], w, h);
    hemL = { x: 2 * kL.x - H_L.x, y: 2 * kL.y - H_L.y };
    hemR = { x: 2 * kR.x - H_R.x, y: 2 * kR.y - H_R.y };
  } else {
    const len = hp.len * (knee ? FIT.KNEE_LENGTH : FIT.LEG_LENGTH);
    hemL = add(H_L, hp.n, len);
    hemR = add(H_R, hp.n, len);
  }
  const hemMid = mid(hemL, hemR);
  const hem = axis(hemL, hemR);
  const hemHalf = Math.max(hem.len / 2 + hp.len * FIT.HEM_EXTRA_HALF, hp.len * 0.75);
  const hemAxis = hem.len > 4 ? hem.a : hp.a;

  const q: BodyQuad = {
    tl: add(add(hMid, hp.a, -waistHalf), hp.n, -waistLift),
    tr: add(add(hMid, hp.a, waistHalf), hp.n, -waistLift),
    bl: add(hemMid, hemAxis, -hemHalf),
    br: add(hemMid, hemAxis, hemHalf),
  };
  const waistMid = mid(q.tl, q.tr);
  return scaleAbout(q, waistMid, adjust.scale, { x: 0, y: adjust.offsetY * hp.len });
}

/**
 * Builds a function that maps garment image UV (0..1) to body pixels.
 * Inside the anchor band it's bilinear; above/below the band rows continue
 * straight along the body so long garments don't taper to a point.
 */
export function makeGarmentMapper(
  q: BodyQuad,
  anchors: { left: number; right: number; topV: number; midV: number },
): (u: number, v: number) => Pt {
  const du = anchors.right - anchors.left || 1;
  const dv = anchors.midV - anchors.topV || 1;
  const row = (t: number, uu: number): Pt => {
    const a = { x: q.tl.x + (q.tr.x - q.tl.x) * uu, y: q.tl.y + (q.tr.y - q.tl.y) * uu };
    const b = { x: q.bl.x + (q.br.x - q.bl.x) * uu, y: q.bl.y + (q.br.y - q.bl.y) * uu };
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };
  const cTop = mid(q.tl, q.tr);
  const cBot = mid(q.bl, q.br);
  const down = { x: cBot.x - cTop.x, y: cBot.y - cTop.y };
  return (u: number, v: number) => {
    const uu = (u - anchors.left) / du;
    const t = (v - anchors.topV) / dv;
    if (t < 0) return add(row(0, uu), down, t);
    if (t > 1) return add(row(1, uu), down, t - 1);
    return row(t, uu);
  };
}

/** Exponential smoothing of landmarks that reacts faster to big moves. */
export function smoothLandmarks(prev: Landmark[] | null, next: Landmark[], scale: number): Landmark[] {
  if (!prev || prev.length !== next.length) return next.map((l) => ({ ...l }));
  return next.map((n, i) => {
    const p = prev[i]!;
    const d = Math.hypot(n.x - p.x, n.y - p.y) / Math.max(scale, 1e-3);
    const k = Math.min(0.9, Math.max(0.35, d * 6));
    return {
      x: p.x + (n.x - p.x) * k,
      y: p.y + (n.y - p.y) * k,
      visibility: n.visibility,
    };
  });
}
