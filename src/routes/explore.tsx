import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATALOG } from "@/lib/garments";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Outfits — TRYME AI" },
      { name: "description", content: "Browse shirts, tees, jackets, hoodies, kurtas, sherwanis, jeans and dresses — and try any of them on live." },
      { property: "og:title", content: "Explore Outfits — TRYME AI" },
      { property: "og:description", content: "Browse menswear and womenswear and try any piece on with your camera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

type Gender = "all" | "men" | "women";

function Explore() {
  const [gender, setGender] = useState<Gender>("men");
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const cats = useMemo(() => ["All", ...Array.from(new Set(CATALOG.map((g) => g.category)))], []);
  const items = CATALOG.filter(
    (g) =>
      (gender === "all" || g.gender === gender) &&
      (cat === "All" || g.category === cat) &&
      g.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">Explore</p>
      <h1 className="mt-1 text-5xl sm:text-7xl">The wardrobe</h1>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["men", "women", "all"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${gender === g ? "bg-ink text-ink-foreground" : "text-muted-foreground"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search outfits" className="rounded-full pl-9" />
        </div>
      </div>
      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${cat === c ? "border-ink bg-ink text-ink-foreground" : "hover:bg-lavender-soft"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <Link key={g.id} to="/try-on" search={{ g: g.id }} className="group rounded-3xl border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lift">
            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-lavender-soft/60 p-6">
              <img src={g.src} alt={g.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{g.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {g.gender} · {g.category}
                </p>
              </div>
              <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-ink-foreground">Try on</span>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && <p className="py-20 text-center text-muted-foreground">No outfits match. Try another filter.</p>}

      <div className="mt-14 rounded-3xl bg-gradient-lavender p-8 text-center">
        <p className="font-display text-3xl sm:text-4xl">Don't see your outfit?</p>
        <p className="mt-2 text-sm text-muted-foreground">Upload a picture or paste a shop link in the studio.</p>
        <Link to="/try-on" className="mt-5 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground">
          Add your own outfit
        </Link>
      </div>
    </main>
  );
}
