import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TryOnStudio } from "@/components/tryon/TryOnStudio";

const search = z.object({ g: z.string().optional() });

export const Route = createFileRoute("/try-on")({
  validateSearch: (s) => search.parse(s),
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Try-On Studio — TRYME AI" },
      { name: "description", content: "Open your camera or upload a photo and see shirts, jackets, kurtas and more fitted to your body in real time." },
      { property: "og:title", content: "Live Try-On Studio — TRYME AI" },
      { property: "og:description", content: "See outfits fitted to your body in real time with your camera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TryOnPage,
});

function TryOnPage() {
  const { g } = Route.useSearch();
  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">Try-On Studio</p>
          <h1 className="mt-1 text-5xl sm:text-6xl">Wear it before you buy it</h1>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Pick an outfit, upload your own or import one from any shop. It follows you as you move.
        </p>
      </div>
      <TryOnStudio {...(g ? { initialGarmentId: g } : {})} />
    </main>
  );
}
