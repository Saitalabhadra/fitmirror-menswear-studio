import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Globe, ScanLine, Shirt, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroModel from "@/assets/hero-model.jpg";
import mirrorModel from "@/assets/model-mirror.jpg";
import casualModel from "@/assets/model-casual.jpg";
import { CATALOG } from "@/lib/garments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRYME AI — Try Before You Buy, See Yourself in Every Outfit" },
      {
        name: "description",
        content: "Real-time virtual try-on: open your camera, pick a shirt, jacket or kurta, and watch it fit your body as you move. Upload or import any outfit.",
      },
      { property: "og:title", content: "TRYME AI — Real-Time Virtual Try-On" },
      { property: "og:description", content: "See yourself in every outfit with live camera try-on, outfit uploads and imports from any shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Camera, title: "Open your camera", text: "Or upload a photo. We find your shoulders, chest and hips in a blink." },
  { icon: Shirt, title: "Pick or add an outfit", text: "Choose from the wardrobe, upload your own picture, or import from any shop." },
  { icon: ScanLine, title: "It moves with you", text: "The outfit follows your body, hides what you're wearing, and fits your size." },
];

function Home() {
  const featured = CATALOG.filter((g) => g.gender === "men").slice(0, 8);
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-lavender opacity-60" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-lavender-deep" /> Real-time body tracking
            </span>
            <h1 className="text-balance-tight mt-6 text-6xl sm:text-7xl xl:text-8xl">
              Try before you buy.
              <span className="block italic text-lavender-deep">See yourself</span>
              in every outfit.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Open your camera and watch shirts, jackets, kurtas and jeans fit your body live — or bring any outfit from your favourite shop.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/try-on">
                  Start Try-On <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="soft" size="xl">
                <Link to="/explore">Explore outfits</Link>
              </Button>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <div>
                <p className="font-display text-4xl">33</p>
                <p className="text-muted-foreground">body points tracked</p>
              </div>
              <div>
                <p className="font-display text-4xl">0</p>
                <p className="text-muted-foreground">videos uploaded</p>
              </div>
              <div>
                <p className="font-display text-4xl">∞</p>
                <p className="text-muted-foreground">outfits from any shop</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="relative overflow-hidden rounded-[2rem] shadow-lift">
              <img src={heroModel} alt="Man trying on a linen overshirt with body tracking points" width={1024} height={1280} className="aspect-[4/5] w-full object-cover" />
              <div className="absolute inset-x-6 h-px animate-scan bg-lavender shadow-[0_0_20px_4px] shadow-lavender" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-card/85 px-4 py-3 backdrop-blur-md">
                <div>
                  <p className="text-xs text-muted-foreground">Now wearing</p>
                  <p className="text-sm font-semibold">Linen Overshirt · Size M</p>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-foreground">Fitted</span>
              </div>
            </div>
            <div className="absolute -left-10 top-16 hidden w-32 animate-float-slow rounded-2xl border bg-card p-2 shadow-soft sm:block">
              <div className="checkerboard rounded-xl p-2">
                <img src={CATALOG[3]?.src} alt="" className="mx-auto h-20 object-contain" />
              </div>
              <p className="mt-1.5 text-center text-[11px] font-semibold">Biker Jacket</p>
            </div>
            <div className="absolute -right-6 bottom-28 hidden w-28 animate-float-slow rounded-2xl border bg-card p-2 shadow-soft [animation-delay:1.5s] sm:block">
              <div className="checkerboard rounded-xl p-2">
                <img src={CATALOG[5]?.src} alt="" className="mx-auto h-20 object-contain" />
              </div>
              <p className="mt-1.5 text-center text-[11px] font-semibold">Silk Kurta</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <img src={mirrorModel} alt="Man in a leather jacket checking his look in a mirror" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full max-w-md rounded-[2rem] object-cover shadow-lift" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">How it works</p>
            <h2 className="mt-2 text-5xl sm:text-6xl">Your mirror, upgraded.</h2>
            <div className="mt-10 space-y-8">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-soft">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">0{i + 1}</p>
                    <p className="text-lg font-semibold">{s.title}</p>
                    <p className="mt-1 text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="bg-lavender-soft/60 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">Menswear edit</p>
              <h2 className="mt-2 text-5xl sm:text-6xl">Ready to try on</h2>
            </div>
            <Button asChild variant="soft">
              <Link to="/explore">
                See all <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((g) => (
              <Link key={g.id} to="/try-on" search={{ g: g.id }} className="group rounded-3xl bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted p-5">
                  <img src={g.src} alt={g.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-sm font-semibold">{g.name}</p>
                <p className="flex items-center justify-between text-xs text-muted-foreground">
                  {g.category}
                  <span className="font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">Try on →</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bring your own */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Camera, t: "Live camera", d: "Front or back camera, mirror view, zoom and before/after compare." },
            { icon: Upload, t: "Upload any outfit", d: "Snap or save a picture of any shirt or dress — we cut it out and fit it to you." },
            { icon: Globe, t: "Import from shops", d: "Paste a product link from your favourite store and try it on in seconds." },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl border bg-card p-7">
              <f.icon className="h-6 w-6 text-lavender-deep" />
              <p className="mt-5 font-display text-3xl">{f.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-ink text-ink-foreground">
          <div className="grid items-center md:grid-cols-[1.3fr_1fr]">
            <div className="p-10 sm:p-14">
              <h2 className="text-5xl sm:text-6xl">Your next look is one tap away.</h2>
              <p className="mt-4 max-w-md text-ink-foreground/65">No downloads, no sign-up. Your camera stays private on your device.</p>
              <Button asChild variant="lavender" size="xl" className="mt-8">
                <Link to="/try-on">
                  Open the studio <ArrowRight />
                </Link>
              </Button>
            </div>
            <img src={casualModel} alt="Smiling man in a grey hoodie" loading="lazy" width={1024} height={1280} className="h-full max-h-[420px] w-full object-cover object-top" />
          </div>
        </div>
      </section>
    </main>
  );
}
