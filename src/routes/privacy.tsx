import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — TRYME AI" },
      { name: "description", content: "How TRYME AI handles your camera, photos and saved looks." },
      { property: "og:title", content: "Privacy — TRYME AI" },
      { property: "og:description", content: "Your camera feed never leaves your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

const POINTS = [
  { t: "Camera stays on your device", d: "Body tracking runs inside your browser. Video frames are never recorded, stored or sent to our servers." },
  { t: "You choose when to save", d: "Photos are only created when you tap Capture or Save look. Saved looks are stored in your browser on this device." },
  { t: "Imported links", d: "When you import an outfit from a website, we fetch only that picture so it can be shown to you. We don't keep it." },
  { t: "Delete anytime", d: "Remove saved looks from My Looks, or clear your browser data to remove everything." },
];

function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-10 pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">Privacy</p>
      <h1 className="mt-2 text-6xl">Your mirror is private.</h1>
      <div className="mt-10 space-y-4">
        {POINTS.map((p) => (
          <div key={p.t} className="rounded-2xl border bg-card p-6">
            <p className="text-lg font-semibold">{p.t}</p>
            <p className="mt-1 text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
