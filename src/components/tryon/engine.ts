/**
 * Frame renderer for the try-on stage. Plain functions over refs — no React.
 * Draws: source frame → (optional) hidden-clothes recolour → lower garment → upper garment.
 */
import type { Garment } from "@/lib/garments";
import { fitGarment, makeGarmentMapper, type FitAdjust, type Landmark, type Pt } from "@/lib/fit";
import { drawWarpedImage } from "@/lib/warp";
import { CLOTHES_CLASS } from "@/lib/vision";

export interface LoadedGarment extends Garment {
  img: HTMLImageElement;
  color: [number, number, number];
}

export interface StageSettings {
  hideClothes: boolean;
  mirror: boolean;
  showPoints: boolean;
  zoom: number;
  compare: boolean;
  compareX: number;
  fitUpper: FitAdjust;
  fitLower: FitAdjust;
}

export interface ClothesMask {
  data: Uint8Array;
  w: number;
  h: number;
  /** RGBA of the small frame the mask was computed from — used to keep folds/shading */
  frame: Uint8ClampedArray;
}

export interface RenderInput {
  ctx: CanvasRenderingContext2D;
  source: CanvasImageSource;
  w: number;
  h: number;
  mirrored: boolean;
  landmarks: Landmark[] | null;
  mask: ClothesMask | null;
  upper: LoadedGarment | null;
  lower: LoadedGarment | null;
  settings: StageSettings;
  scratch: HTMLCanvasElement;
}

function baseTransform(ctx: CanvasRenderingContext2D, w: number, h: number, mirrored: boolean, zoom: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (mirrored) ctx.setTransform(-1, 0, 0, 1, w, 0);
  if (zoom !== 1) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h / 2);
  }
}

const KEY_POINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
const BONES: Array<[number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export interface RenderResult {
  upperFitted: boolean;
  lowerFitted: boolean;
}

export function renderStage(input: RenderInput): RenderResult {
  const { ctx, source, w, h, mirrored, landmarks, mask, upper, lower, settings, scratch } = input;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  baseTransform(ctx, w, h, mirrored, settings.zoom);
  ctx.drawImage(source, 0, 0, w, h);

  const upperQ = upper ? fitGarment(landmarks ?? undefined, upper, w, h, settings.fitUpper) : null;
  const lowerQ = lower ? fitGarment(landmarks ?? undefined, lower, w, h, settings.fitLower) : null;
  const upperMap = upper && upperQ ? makeGarmentMapper(upperQ, upper.anchors) : null;
  const lowerMap = lower && lowerQ ? makeGarmentMapper(lowerQ, lower.anchors) : null;

  if (settings.hideClothes && mask && (upperMap || lowerMap)) {
    const upperHem = upperMap ? upperMap(0.5, 1).y / h + 0.02 : -1;
    const lowerWaist = lowerMap ? lowerMap(0.5, 0).y / h - 0.02 : 2;
    paintHiddenClothes(scratch, mask, upper?.color ?? null, lower?.color ?? null, upperHem, lowerWaist);
    ctx.save();
    ctx.filter = `blur(${Math.max(2, Math.round(w / 220))}px)`;
    ctx.drawImage(scratch, 0, 0, w, h);
    ctx.restore();
  }

  if (lower && lowerMap) drawWarpedImage(ctx, lower.img, lower.img.naturalWidth, lower.img.naturalHeight, lowerMap, 4, 10);
  if (upper && upperMap) drawWarpedImage(ctx, upper.img, upper.img.naturalWidth, upper.img.naturalHeight, upperMap, 6, 8);

  if (settings.showPoints && landmarks) drawSkeleton(ctx, landmarks, w, h);

  if (settings.compare) {
    const cx = settings.compareX * w;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.rect(0, 0, cx, h);
    ctx.clip();
    baseTransform(ctx, w, h, mirrored, settings.zoom);
    ctx.drawImage(source, 0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(cx - 1.5, 0, 3, h);
    ctx.restore();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { upperFitted: !!upperMap, lowerFitted: !!lowerMap };
}

function drawSkeleton(ctx: CanvasRenderingContext2D, lms: Landmark[], w: number, h: number) {
  const p = (i: number): Pt | null => {
    const l = lms[i];
    if (!l || (l.visibility ?? 1) < 0.5) return null;
    return { x: l.x * w, y: l.y * h };
  };
  const r = Math.max(3, w / 220);
  ctx.save();
  ctx.lineWidth = Math.max(1.5, w / 500);
  ctx.strokeStyle = "rgba(205,185,255,0.85)";
  for (const [a, b] of BONES) {
    const pa = p(a);
    const pb = p(b);
    if (!pa || !pb) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (const i of KEY_POINTS) {
    const pt = p(i);
    if (!pt) continue;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Paints the person's own clothing (from the segmentation mask) in the new
 * garment's colour, keeping the original light/shadow so folds still read.
 */
function paintHiddenClothes(
  scratch: HTMLCanvasElement,
  mask: ClothesMask,
  upperColor: [number, number, number] | null,
  lowerColor: [number, number, number] | null,
  upperHemY: number,
  lowerWaistY: number,
) {
  const { w, h, data, frame } = mask;
  if (scratch.width !== w) scratch.width = w;
  if (scratch.height !== h) scratch.height = h;
  const sctx = scratch.getContext("2d")!;
  const out = sctx.createImageData(w, h);
  const o = out.data;

  let sum = 0;
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i] === CLOTHES_CLASS) {
      sum += 0.299 * frame[i * 4]! + 0.587 * frame[i * 4 + 1]! + 0.114 * frame[i * 4 + 2]!;
      n++;
    }
  }
  const mean = n ? sum / n / 255 : 0.5;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    const col = upperColor && ny < upperHemY ? upperColor : lowerColor && ny > lowerWaistY ? lowerColor : null;
    if (!col) continue;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (data[i] !== CLOTHES_CLASS) continue;
      const lum = (0.299 * frame[i * 4]! + 0.587 * frame[i * 4 + 1]! + 0.114 * frame[i * 4 + 2]!) / 255;
      const shade = Math.min(1.25, Math.max(0.6, 1 + (lum - mean) * 0.9));
      o[i * 4] = Math.min(255, col[0] * shade);
      o[i * 4 + 1] = Math.min(255, col[1] * shade);
      o[i * 4 + 2] = Math.min(255, col[2] * shade);
      o[i * 4 + 3] = 255;
    }
  }
  sctx.putImageData(out, 0, 0);
}
