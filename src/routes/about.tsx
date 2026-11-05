import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TRYME AI" },
      { name: "description", content: "TRYME AI helps you shop with confidence by trying outfits on with your camera before you buy." },
      { property: "og:title", content: "About TRYME AI" },
      { property: "og:description", content: "Why we built a real-time virtual fitting room for everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const TIPS = [
  "Stand 1.5–2 m from the camera with your shoulders and hips in view.",
  "Use even, front-facing light — avoid a bright window behind you.",
  "Plain backgrounds and fitted clothes give the most accurate fit.",
  "Use the Size and Position sliders to fine-tune any outfit.",
];

function About() {
  return (
    <main className="mx-auto max-w-4xl px-5 pb-10 pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">About</p>
      <h1 className="mt-2 text-6xl sm:text-7xl">Shopping, without the guesswork.</h1>
      <p className="mt-8 text-lg text-muted-foreground">
        Buying clothes online means imagining how they'll look. TRYME AI replaces imagination with a mirror: it tracks 33 points on your body and fits each outfit to your shoulders, chest and hips — live, as you move.
      </p>
      <p className="mt-4 text-lg text-muted-foreground">
        Everything happens in your browser. Your camera feed is never recorded or uploaded, and saved looks stay on your device.
      </p>

      <h2 className="mt-16 text-4xl">Tips for the best fit</h2>
      <ol className="mt-6 space-y-4">
        {TIPS.map((t, i) => (
          <li key={t} className="flex gap-4 rounded-2xl border bg-card p-5">
            <span className="font-display text-3xl text-lavender-deep">{i + 1}</span>
            <span className="pt-1.5">{t}</span>
          </li>
        ))}
      </ol>

      <Button asChild variant="hero" size="xl" className="mt-12">
        <Link to="/try-on">Try it now</Link>
      </Button>
    </main>
  );
}
