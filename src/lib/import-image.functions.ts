import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_BYTES = 8 * 1024 * 1024;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function isBlockedHost(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h.startsWith("[") || h === "::1") return true;
  return false;
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function findImageInHtml(html: string, base: string): string | null {
  const metaPatterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /"image"\s*:\s*\[?\s*"([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const re of metaPatterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try {
        return new URL(m[1].replace(/&amp;/g, "&"), base).toString();
      } catch {
        /* keep looking */
      }
    }
  }
  const img = html.match(/<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/i);
  if (img?.[1]) {
    try {
      return new URL(img[1], base).toString();
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchChecked(url: string) {
  const u = new URL(url);
  if (!["http:", "https:"].includes(u.protocol) || isBlockedHost(u.hostname)) {
    throw new Error("That link can't be used. Please paste a public product or image link.");
  }
  const res = await fetch(u.toString(), {
    headers: { "User-Agent": UA, Accept: "text/html,image/avif,image/webp,image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`The website answered with an error (${res.status}).`);
  return res;
}

/**
 * Imports a garment picture from another website. Accepts a direct image
 * link or a product page link (uses the page's main product picture).
 */
export const importGarmentFromUrl = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ url: z.string().trim().url().max(2000) }).parse(input))
  .handler(async ({ data }) => {
    let res = await fetchChecked(data.url);
    let type = res.headers.get("content-type") ?? "";
    let finalUrl = res.url || data.url;

    if (type.includes("text/html")) {
      const html = (await res.text()).slice(0, 1_500_000);
      const imgUrl = findImageInHtml(html, finalUrl);
      if (!imgUrl) throw new Error("We couldn't find a product picture on that page. Try the image link instead.");
      res = await fetchChecked(imgUrl);
      type = res.headers.get("content-type") ?? "";
      finalUrl = res.url || imgUrl;
    }

    if (!type.startsWith("image/")) {
      throw new Error("That link isn't a picture. Right-click the product photo and copy its image address.");
    }
    if (type.includes("svg")) throw new Error("Vector images aren't supported. Use a JPG, PNG or WebP picture.");
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) throw new Error("That picture is too large (max 8 MB).");
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error("That picture is too large (max 8 MB).");

    return {
      dataUrl: `data:${type.split(";")[0]};base64,${toBase64(buf)}`,
      sourceUrl: finalUrl,
      host: new URL(finalUrl).hostname.replace(/^www\./, ""),
    };
  });
