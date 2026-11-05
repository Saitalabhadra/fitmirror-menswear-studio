import type { Pt } from "./fit";

/**
 * Draws `img` deformed by `map(u, v)` (UV 0..1 → canvas px) using a grid of
 * affine-mapped triangles. Works on any 2D canvas, no WebGL needed.
 */
export function drawWarpedImage(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
  map: (u: number, v: number) => Pt,
  cols = 6,
  rows = 8,
) {
  const grid: Pt[][] = [];
  for (let j = 0; j <= rows; j++) {
    const r: Pt[] = [];
    for (let i = 0; i <= cols; i++) r.push(map(i / cols, j / rows));
    grid.push(r);
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const s00 = { x: (i / cols) * iw, y: (j / rows) * ih };
      const s10 = { x: ((i + 1) / cols) * iw, y: (j / rows) * ih };
      const s01 = { x: (i / cols) * iw, y: ((j + 1) / rows) * ih };
      const s11 = { x: ((i + 1) / cols) * iw, y: ((j + 1) / rows) * ih };
      const d00 = grid[j]![i]!;
      const d10 = grid[j]![i + 1]!;
      const d01 = grid[j + 1]![i]!;
      const d11 = grid[j + 1]![i + 1]!;
      drawTriangle(ctx, img, s00, s10, s11, d00, d10, d11);
      drawTriangle(ctx, img, s00, s11, s01, d00, d11, d01);
    }
  }
}

function expand(p: Pt, c: Pt, by: number): Pt {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * by, y: p.y + (dy / len) * by };
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  s0: Pt,
  s1: Pt,
  s2: Pt,
  d0: Pt,
  d1: Pt,
  d2: Pt,
) {
  const denom = s0.x * (s2.y - s1.y) - s1.x * s2.y + s2.x * s1.y + (s1.x - s2.x) * s0.y;
  if (Math.abs(denom) < 1e-6) return;
  const a = -(s0.y * (d2.x - d1.x) - s1.y * d2.x + s2.y * d1.x + (s1.y - s2.y) * d0.x) / denom;
  const c = (s0.x * (d2.x - d1.x) - s1.x * d2.x + s2.x * d1.x + (s1.x - s2.x) * d0.x) / denom;
  const e =
    (s0.x * (s2.y * d1.x - s1.y * d2.x) +
      s0.y * (s1.x * d2.x - s2.x * d1.x) +
      (s2.x * s1.y - s1.x * s2.y) * d0.x) /
    denom;
  const b = -(s0.y * (d2.y - d1.y) - s1.y * d2.y + s2.y * d1.y + (s1.y - s2.y) * d0.y) / denom;
  const d = (s0.x * (d2.y - d1.y) - s1.x * d2.y + s2.x * d1.y + (s1.x - s2.x) * d0.y) / denom;
  const f =
    (s0.x * (s2.y * d1.y - s1.y * d2.y) +
      s0.y * (s1.x * d2.y - s2.x * d1.y) +
      (s2.x * s1.y - s1.x * s2.y) * d0.y) /
    denom;

  // Slightly enlarge the clip triangle to hide hairline seams.
  const cx = (d0.x + d1.x + d2.x) / 3;
  const cy = (d0.y + d1.y + d2.y) / 3;
  const c0 = expand(d0, { x: cx, y: cy }, 0.8);
  const c1 = expand(d1, { x: cx, y: cy }, 0.8);
  const c2 = expand(d2, { x: cx, y: cy }, 0.8);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y);
  ctx.lineTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
