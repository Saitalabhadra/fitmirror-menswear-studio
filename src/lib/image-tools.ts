/** Browser-only image helpers. Call only from effects or event handlers. */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

function canvasFor(img: HTMLImageElement, maxSide: number) {
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * s));
  const h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return { c, ctx, w, h };
}

/**
 * Prepares a garment photo for try-on: removes a plain studio/product-page
 * background by flood-filling from the edges, then trims empty space.
 */
export async function prepareGarmentImage(src: string, removeBg = true): Promise<string> {
  const img = await loadImage(src);
  const { c, ctx, w, h } = canvasFor(img, 1000);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Already transparent at the corners? Keep as is.
  const cornerAlpha = [0, w - 1, (h - 1) * w, h * w - 1].map((i) => px[i * 4 + 3]!);
  const alreadyCut = cornerAlpha.every((a) => a < 20);

  if (removeBg && !alreadyCut) {
    const tol = 42;
    const seen = new Uint8Array(w * h);
    const stack: number[] = [];
    const seedAt = (i: number) => {
      if (!seen[i]) {
        seen[i] = 1;
        stack.push(i);
      }
    };
    for (let x = 0; x < w; x++) {
      seedAt(x);
      seedAt((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      seedAt(y * w);
      seedAt(y * w + w - 1);
    }
    const removed = new Uint8Array(w * h);
    // Reference colour per seed region: compare with the neighbour that brought us here.
    const ref = new Int32Array(w * h * 3);
    for (const i of stack) {
      ref[i * 3]! = px[i * 4]!;
      ref[i * 3 + 1]! = px[i * 4 + 1]!;
      ref[i * 3 + 2]! = px[i * 4 + 2]!;
    }
    let count = 0;
    while (stack.length) {
      const i = stack.pop()!;
      const r = px[i * 4]!;
      const g = px[i * 4 + 1]!;
      const b = px[i * 4 + 2]!;
      const dr = r - ref[i * 3]!;
      const dg = g - ref[i * 3 + 1]!;
      const db = b - ref[i * 3 + 2]!;
      if (Math.sqrt(dr * dr + dg * dg + db * db) > tol && px[i * 4 + 3]! > 20) continue;
      removed[i] = 1;
      count++;
      const x = i % w;
      const y = (i / w) | 0;
      const push = (j: number) => {
        if (seen[j]) return;
        seen[j] = 1;
        // drift-limited: reference follows slowly so gradients are removed but edges are kept
        ref[j * 3]! = (ref[i * 3]! * 3 + r) >> 2;
        ref[j * 3 + 1]! = (ref[i * 3 + 1]! * 3 + g) >> 2;
        ref[j * 3 + 2]! = (ref[i * 3 + 2]! * 3 + b) >> 2;
        stack.push(j);
      };
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (y > 0) push(i - w);
      if (y < h - 1) push(i + w);
    }
    const frac = count / (w * h);
    if (frac > 0.02 && frac < 0.96) {
      for (let i = 0; i < w * h; i++) {
        if (removed[i]) {
          px[i * 4 + 3]! = 0;
        } else {
          // soften the edge: pixels touching removed background get partial alpha
          const x = i % w;
          const y = (i / w) | 0;
          let n = 0;
          if (x > 0 && removed[i - 1]) n++;
          if (x < w - 1 && removed[i + 1]) n++;
          if (y > 0 && removed[i - w]) n++;
          if (y < h - 1 && removed[i + w]) n++;
          if (n) px[i * 4 + 3]! = Math.min(px[i * 4 + 3]!, 255 - n * 45);
        }
      }
      ctx.putImageData(data, 0, 0);
    }
  }

  return trimTransparent(c, ctx);
}

function trimTransparent(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
  const { width: w, height: h } = c;
  const px = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3]! > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return c.toDataURL("image/png");
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

/** Average colour of the garment's opaque pixels, used to hide the clothes underneath. */
export function averageColor(img: HTMLImageElement): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = 40;
  c.height = 40;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 40, 40);
  const px = ctx.getImageData(0, 0, 40, 40).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3]! > 200) {
      r += px[i]!;
      g += px[i + 1]!;
      b += px[i + 2]!;
      n++;
    }
  }
  if (!n) return [128, 128, 128];
  return [r / n, g / n, b / n];
}
