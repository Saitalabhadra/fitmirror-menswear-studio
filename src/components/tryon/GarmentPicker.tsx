import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Globe, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CATALOG, CATEGORIES, type Category, type Garment } from "@/lib/garments";
import { fileToDataUrl, prepareGarmentImage } from "@/lib/image-tools";
import { importGarmentFromUrl } from "@/lib/import-image.functions";

type Tab = "catalog" | "add";
type Gender = "all" | "men" | "women";

export function GarmentPicker({
  uploads,
  activeIds,
  onWear,
  onAddUpload,
}: {
  uploads: Garment[];
  activeIds: string[];
  onWear: (g: Garment) => void;
  onAddUpload: (dataUrl: string, name: string, category: Category) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("catalog");
  const [gender, setGender] = useState<Gender>("men");
  const list = useMemo(() => CATALOG.filter((g) => gender === "all" || g.gender === gender || g.gender === "unisex"), [gender]);

  return (
    <div className="rounded-3xl border bg-card p-4 shadow-soft lg:sticky lg:top-24">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-sm font-semibold">
        {(["catalog", "add"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full py-2 transition-colors ${tab === t ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "catalog" ? "Wardrobe" : "Add your own"}
          </button>
        ))}
      </div>

      {tab === "catalog" ? (
        <>
          <div className="mb-3 flex gap-2">
            {(["men", "women", "all"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${gender === g ? "border-ink bg-ink text-ink-foreground" : "hover:bg-lavender-soft"}`}
              >
                {g}
              </button>
            ))}
          </div>
          {uploads.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your uploads</p>
              <Grid items={uploads} activeIds={activeIds} onWear={onWear} />
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Wardrobe</p>
            </>
          )}
          <Grid items={list} activeIds={activeIds} onWear={onWear} />
        </>
      ) : (
        <AddOwn
          onAdd={async (...a) => {
            await onAddUpload(...a);
            setTab("catalog");
          }}
        />
      )}
    </div>
  );
}

function Grid({ items, activeIds, onWear }: { items: Garment[]; activeIds: string[]; onWear: (g: Garment) => void }) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:grid lg:max-h-[56vh] lg:grid-cols-2 lg:overflow-y-auto lg:overflow-x-visible">
      {items.map((g) => {
        const active = activeIds.includes(`${g.id}:${g.category}`);
        return (
          <button
            key={g.id}
            onClick={() => onWear(g)}
            className={`group relative w-32 shrink-0 rounded-2xl border p-2 text-left transition-all lg:w-auto ${active ? "border-ink ring-2 ring-ink" : "hover:-translate-y-0.5 hover:shadow-soft"}`}
          >
            <div className="checkerboard flex aspect-square items-center justify-center rounded-xl p-2">
              <img src={g.src} alt={g.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
            </div>
            <p className="mt-2 truncate text-xs font-semibold">{g.name}</p>
            <p className="text-[11px] text-muted-foreground">{g.category}</p>
            {active && (
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-ink-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AddOwn({ onAdd }: { onAdd: (dataUrl: string, name: string, category: Category) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<Category>("Shirts");
  const [removeBg, setRemoveBg] = useState(true);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<"file" | "url" | null>(null);
  const importFn = useServerFn(importGarmentFromUrl);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a picture file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("That picture is too large (max 12 MB).");
      return;
    }
    setBusy("file");
    try {
      const raw = await fileToDataUrl(file);
      const ready = await prepareGarmentImage(raw, removeBg);
      await onAdd(ready, file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "My outfit", category);
      toast.success("Outfit added — it's on you now");
    } catch {
      toast.error("That picture couldn't be used. Try another one.");
    } finally {
      setBusy(null);
    }
  };

  const handleUrl = async () => {
    const value = url.trim();
    if (!value) return;
    try {
      new URL(value);
    } catch {
      toast.error("Please paste a full link starting with https://");
      return;
    }
    setBusy("url");
    try {
      const res = await importFn({ data: { url: value } });
      const ready = await prepareGarmentImage(res.dataUrl, removeBg);
      await onAdd(ready, `From ${res.host}`, category);
      setUrl("");
      toast.success(`Imported from ${res.host}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't import from that link.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="cat" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          What kind of outfit?
        </Label>
        <select
          id="cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-lavender-soft px-3 py-2.5">
        <Label htmlFor="rmbg" className="flex flex-col text-sm font-medium">
          Remove background
          <span className="text-xs font-normal text-muted-foreground">Best for product photos</span>
        </Label>
        <Switch id="rmbg" checked={removeBg} onCheckedChange={setRemoveBg} />
      </div>

      <div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void handleFile(f);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-lavender bg-lavender-soft/50 px-4 py-8 text-center transition-colors hover:bg-lavender-soft"
        >
          {busy === "file" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-sm font-semibold">Upload outfit image</span>
          <span className="text-xs text-muted-foreground">Drag & drop or tap — front view works best</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <Label htmlFor="url" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Globe className="h-3.5 w-3.5" /> Import from a website
        </Label>
        <div className="flex gap-2">
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleUrl()}
            placeholder="Paste product or image link"
            className="h-10 rounded-xl"
          />
          <Button variant="hero" className="h-10" onClick={() => void handleUrl()} disabled={busy !== null || !url.trim()}>
            {busy === "url" ? <Loader2 className="animate-spin" /> : "Import"}
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Works with most shop product pages or a direct picture link.</p>
      </div>
    </div>
  );
}
