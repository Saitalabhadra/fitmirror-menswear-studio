import { describe, expect, it } from "vitest";
import { fitGarment, makeGarmentMapper, type Landmark } from "./fit";

/** Front-facing person: shoulders at y=0.3, hips at y=0.6 (normalized). */
function person(opts: { hips?: boolean; ankles?: boolean } = {}): Landmark[] {
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0 }));
  const set = (i: number, x: number, y: number, v = 0.99) => (lms[i] = { x, y, visibility: v });
  set(11, 0.6, 0.3); // person's left shoulder → viewer's right
  set(12, 0.4, 0.3);
  set(23, 0.56, 0.6, opts.hips === false ? 0.1 : 0.99);
  set(24, 0.44, 0.6, opts.hips === false ? 0.1 : 0.99);
  set(25, 0.56, 0.75);
  set(26, 0.44, 0.75);
  set(27, 0.56, 0.9, opts.ankles === false ? 0.1 : 0.99);
  set(28, 0.44, 0.9, opts.ankles === false ? 0.1 : 0.99);
  return lms;
}

const W = 1000;
const H = 1000;

describe("garment fitting", () => {
  it("places a shirt's shoulder seams just outside the shoulders", () => {
    const q = fitGarment(person(), { kind: "top" }, W, H)!;
    expect(q.tl.x).toBeLessThan(400);
    expect(q.tr.x).toBeGreaterThan(600);
    expect(q.tl.y).toBeLessThan(300);
  });

  it("anchors a shirt's hip line on the hips", () => {
    const q = fitGarment(person(), { kind: "top" }, W, H)!;
    expect(q.bl.y).toBeCloseTo(600, 0);
    expect(q.br.y).toBeCloseTo(600, 0);
  });

  it("still fits a top when hips are out of frame", () => {
    const q = fitGarment(person({ hips: false }), { kind: "top" }, W, H);
    expect(q).not.toBeNull();
    expect(q!.bl.y).toBeGreaterThan(500);
  });

  it("returns nothing when shoulders are not visible", () => {
    const lms = person();
    lms[11] = { ...lms[11]!, visibility: 0.1 };
    expect(fitGarment(lms, { kind: "top" }, W, H)).toBeNull();
  });

  it("runs trousers from above the hips down to the ankles", () => {
    const q = fitGarment(person(), { kind: "bottom", hemAt: "ankle" }, W, H)!;
    expect(q.tl.y).toBeLessThan(600);
    expect(q.bl.y).toBeCloseTo(900, 0);
  });

  it("ends a skirt at the knees", () => {
    const q = fitGarment(person(), { kind: "bottom", hemAt: "knee" }, W, H)!;
    expect(q.bl.y).toBeCloseTo(750, 0);
  });

  it("size slider makes the garment wider", () => {
    const a = fitGarment(person(), { kind: "top" }, W, H)!;
    const b = fitGarment(person(), { kind: "top" }, W, H, { scale: 1.3, offsetY: 0 })!;
    expect(b.tr.x - b.tl.x).toBeGreaterThan(a.tr.x - a.tl.x);
  });

  it("long garments continue straight below the hips instead of narrowing", () => {
    const q = fitGarment(person(), { kind: "long" }, W, H)!;
    const map = makeGarmentMapper(q, { left: 0.3, right: 0.7, topV: 0.1, midV: 0.5 });
    const atHips = map(0.7, 0.5).x - map(0.3, 0.5).x;
    const atHem = map(0.7, 1).x - map(0.3, 1).x;
    expect(atHem).toBeCloseTo(atHips, 3);
    expect(map(0.5, 1).y).toBeGreaterThan(map(0.5, 0.5).y);
  });
});
