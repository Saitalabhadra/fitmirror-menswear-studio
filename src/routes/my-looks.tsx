import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Columns2, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteLook, downloadDataUrl, listLooks, type SavedLook } from "@/lib/looks-store";

export const Route = createFileRoute("/my-looks")({
  head: () => ({
    meta: [
      { title: "My Looks — TRYME AI" },
      { name: "description", content: "Your saved try-on photos. Compare looks side by side, download or delete them." },
      { property: "og:title", content: "My Looks — TRYME AI" },
      { property: "og:description", content: "Your saved try-on photos, kept privately on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyLooks,
});

function MyLooks() {
  const [looks, setLooks] = useState<SavedLook[] | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    listLooks()
      .then(setLooks)
      .catch(() => setLooks([]));
  }, []);

  const remove = async (id: string) => {
    await deleteLook(id);
    setLooks((l) => l?.filter((x) => x.id !== id) ?? null);
    setCompare((c) => c.filter((x) => x !== id));
    toast.success("Look deleted");
  };

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-2)));

  const pair = compare.map((id) => looks?.find((l) => l.id === id)).filter(Boolean) as SavedLook[];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lavender-deep">My Looks</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-1 text-5xl sm:text-7xl">Saved looks</h1>
        <p className="text-sm text-muted-foreground">Saved only on this device. Tap two looks to compare.</p>
      </div>

      {pair.length === 2 && (
        <div className="mt-8 grid grid-cols-2 gap-4 rounded-3xl bg-ink p-4">
          {pair.map((l) => (
            <div key={l.id}>
              <img src={l.image} alt="Saved look" className="w-full rounded-2xl" />
              <p className="mt-2 text-sm text-ink-foreground">{l.garments.join(" + ") || "Look"}</p>
            </div>
          ))}
        </div>
      )}

      {looks === null ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : looks.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed p-16 text-center">
          <p className="font-display text-4xl">No looks yet</p>
          <p className="mt-2 text-muted-foreground">Try something on and tap "Save look".</p>
          <Button asChild variant="hero" size="xl" className="mt-6">
            <Link to="/try-on">Open the studio</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {looks.map((l) => (
            <div key={l.id} className={`overflow-hidden rounded-3xl border bg-card ${compare.includes(l.id) ? "ring-2 ring-ink" : ""}`}>
              <img src={l.image} alt="Saved look" loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{l.garments.join(" + ") || "Look"}</p>
                <p className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</p>
                <div className="mt-3 flex gap-1.5">
                  <Button size="sm" variant="soft" onClick={() => toggleCompare(l.id)} aria-label="Compare">
                    <Columns2 />
                  </Button>
                  <Button size="sm" variant="soft" onClick={() => downloadDataUrl(l.image, `tryme-look-${l.id}.jpg`)} aria-label="Download">
                    <Download />
                  </Button>
                  <Button size="sm" variant="soft" onClick={() => void remove(l.id)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
