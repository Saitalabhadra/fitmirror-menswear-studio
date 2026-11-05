import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Download,
  Heart,
  ImageUp,
  Loader2,
  Minus,
  Plus,
  RefreshCcw,
  ScanLine,
  SplitSquareHorizontal,
  SwitchCamera,
  FlipHorizontal2,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CATALOG, CATEGORIES, defaultAnchors, findGarment, kindForCategory, type Category, type Garment } from "@/lib/garments";
import { smoothLandmarks, type Landmark } from "@/lib/fit";
import { averageColor, fileToDataUrl, loadImage } from "@/lib/image-tools";
import { loadVision, setVisionMode, type Vision } from "@/lib/vision";
import { downloadDataUrl, saveLook } from "@/lib/looks-store";
import { renderStage, type ClothesMask, type LoadedGarment, type StageSettings } from "./engine";
import { GarmentPicker } from "./GarmentPicker";

type SourceMode = "none" | "camera" | "photo";
type CamStatus = "idle" | "requesting" | "live" | "denied" | "error";
type VisionStatus = "idle" | "loading" | "ready" | "error";

const DEFAULT_SETTINGS: StageSettings = {
  hideClothes: true,
  mirror: true,
  showPoints: false,
  zoom: 1,
  compare: false,
  compareX: 0.5,
  fitUpper: { scale: 1, offsetY: 0 },
  fitLower: { scale: 1, offsetY: 0 },
};

const SEG_WIDTH = 256;

export function TryOnStudio({ initialGarmentId }: { initialGarmentId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const visionRef = useRef<Vision | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const landmarksRef = useRef<Landmark[] | null>(null);
  const maskRef = useRef<ClothesMask | null>(null);
  const segCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const frameCountRef = useRef(0);
  const garmentCache = useRef(new Map<string, LoadedGarment>());

  const [mode, setMode] = useState<SourceMode>("none");
  const modeRef = useRef<SourceMode>("none");
  const [camStatus, setCamStatus] = useState<CamStatus>("idle");
  const [visionStatus, setVisionStatus] = useState<VisionStatus>("idle");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [settings, setSettings] = useState<StageSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings);
  const [upper, setUpper] = useState<LoadedGarment | null>(null);
  const [lower, setLower] = useState<LoadedGarment | null>(null);
  const upperRef = useRef<LoadedGarment | null>(null);
  const lowerRef = useRef<LoadedGarment | null>(null);
  const [uploads, setUploads] = useState<Garment[]>([]);
  const [tracking, setTracking] = useState<"none" | "partial" | "ok">("none");
  const trackingRef = useRef(tracking);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    upperRef.current = upper;
    lowerRef.current = lower;
  }, [upper, lower]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const patch = (p: Partial<StageSettings>) => setSettings((s) => ({ ...s, ...p }));

  // ---------- garments ----------
  const loadGarment = useCallback(async (g: Garment): Promise<LoadedGarment> => {
    const key = `${g.id}:${g.category}`;
    const cached = garmentCache.current.get(key);
    if (cached) return cached;
    const img = await loadImage(g.src);
    const lg: LoadedGarment = { ...g, img, color: averageColor(img) };
    garmentCache.current.set(key, lg);
    return lg;
  }, []);

  const wear = useCallback(
    async (g: Garment) => {
      try {
        const lg = await loadGarment(g);
        if (lg.kind === "bottom") setLower((cur) => (cur?.id === lg.id && cur.category === lg.category ? null : lg));
        else setUpper((cur) => (cur?.id === lg.id && cur.category === lg.category ? null : lg));
      } catch {
        toast.error("That outfit image couldn't be loaded.");
      }
    },
    [loadGarment],
  );

  useEffect(() => {
    const g = findGarment(initialGarmentId) ?? CATALOG[0];
    if (g) void loadGarment(g).then((lg) => (lg.kind === "bottom" ? setLower(lg) : setUpper(lg)));
  }, [initialGarmentId, loadGarment]);

  const addUpload = useCallback(
    async (dataUrl: string, name: string, category: Category) => {
      const kind = kindForCategory(category);
      const g: Garment = {
        id: `upload-${Date.now()}`,
        name,
        category,
        gender: "unisex",
        kind,
        ...(category === "Skirts" ? { hemAt: "knee" as const } : {}),
        anchors: defaultAnchors(kind),
        src: dataUrl,
        uploaded: true,
      };
      setUploads((u) => [g, ...u]);
      const lg = await loadGarment(g);
      // Show ONLY the newly added dress in its slot.
      if (lg.kind === "bottom") setLower(lg);
      else setUpper(lg);
      if (lg.kind === "long" && (category === "Dresses" || category === "Sarees")) setLower(null);
    },
    [loadGarment],
  );

  const recategorize = useCallback(
    async (g: LoadedGarment, category: Category) => {
      const kind = kindForCategory(category);
      const next: Garment = {
        ...g,
        category,
        kind,
        anchors: defaultAnchors(kind),
        ...(category === "Skirts" ? { hemAt: "knee" as const } : {}),
      };
      setUploads((u) => u.map((x) => (x.id === g.id ? next : x)));
      const lg = await loadGarment(next);
      if (g.kind === "bottom") setLower(null);
      else setUpper(null);
      if (lg.kind === "bottom") setLower(lg);
      else setUpper(lg);
    },
    [loadGarment],
  );

  // ---------- vision ----------
  const ensureVision = useCallback(async () => {
    if (visionRef.current) return visionRef.current;
    setVisionStatus("loading");
    try {
      const v = await loadVision();
      visionRef.current = v;
      setVisionStatus("ready");
      return v;
    } catch (e) {
      console.error(e);
      setVisionStatus("error");
      toast.error("Body tracking couldn't start. Check your connection and try again.");
      return null;
    }
  }, []);

  const segmentSource = (v: Vision, src: CanvasImageSource, sw: number, sh: number, ts: number | null) => {
    if (!v.seg) return;
    if (!segCanvasRef.current) segCanvasRef.current = document.createElement("canvas");
    const c = segCanvasRef.current;
    const w = SEG_WIDTH;
    const h = Math.max(1, Math.round((SEG_WIDTH * sh) / sw));
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const sctx = c.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(src, 0, 0, w, h);
    const result = ts === null ? v.seg.segment(c) : v.seg.segmentForVideo(c, ts);
    try {
      const m = result.categoryMask;
      if (m) {
        maskRef.current = {
          data: new Uint8Array(m.getAsUint8Array()),
          w: m.width,
          h: m.height,
          frame: sctx.getImageData(0, 0, m.width, m.height).data,
        };
      }
    } finally {
      result.close();
    }
  };

  // ---------- camera ----------
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (face: "user" | "environment" = facing) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamStatus("error");
        toast.error("Your browser doesn't support the camera. Try uploading a photo instead.");
        return;
      }
      setCamStatus("requesting");
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        lastVideoTimeRef.current = -1;
        landmarksRef.current = null;
        maskRef.current = null;
        photoRef.current = null;
        setMode("camera");
        setCamStatus("live");
        const v = await ensureVision();
        if (v) await setVisionMode(v, "VIDEO");
      } catch (e) {
        const name = (e as { name?: string }).name;
        setCamStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      }
    },
    [facing, stopCamera, ensureVision],
  );

  const switchCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    patch({ mirror: next === "user" });
    void startCamera(next);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ---------- photo ----------
  const usePhoto = async (file: File) => {
    try {
      const url = await fileToDataUrl(file);
      const img = await loadImage(url);
      stopCamera();
      setCamStatus("idle");
      photoRef.current = img;
      landmarksRef.current = null;
      maskRef.current = null;
      setMode("photo");
      patch({ mirror: false });
      const v = await ensureVision();
      if (!v) return;
      await setVisionMode(v, "IMAGE");
      const res = v.pose.detect(img);
      landmarksRef.current = (res.landmarks[0] as Landmark[] | undefined) ?? null;
      segmentSource(v, img, img.naturalWidth, img.naturalHeight, null);
      if (!landmarksRef.current) toast.message("We couldn't find a person in that photo. Try a front-facing photo with your shoulders visible.");
    } catch {
      toast.error("That photo couldn't be opened.");
    }
  };

  // ---------- render loop ----------
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const canvas = canvasRef.current;
      const m = modeRef.current;
      if (!canvas || m === "none") return;
      const v = visionRef.current;
      let source: CanvasImageSource | null = null;
      let w = 0;
      let h = 0;
      if (m === "camera") {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !video.videoWidth) return;
        source = video;
        w = video.videoWidth;
        h = video.videoHeight;
        if (v && v.mode === "VIDEO" && video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          const ts = performance.now();
          try {
            const res = v.pose.detectForVideo(video, ts);
            const raw = res.landmarks[0] as Landmark[] | undefined;
            if (raw) {
              const ls = raw[11];
              const rs = raw[12];
              const sc = ls && rs ? Math.hypot(ls.x - rs.x, ls.y - rs.y) : 0.2;
              landmarksRef.current = smoothLandmarks(landmarksRef.current, raw, sc);
            } else {
              landmarksRef.current = null;
            }
            frameCountRef.current++;
            if (settingsRef.current.hideClothes && frameCountRef.current % 2 === 0) {
              segmentSource(v, video, w, h, ts + 0.5);
            }
          } catch (e) {
            console.warn(e);
          }
        }
      } else if (m === "photo" && photoRef.current) {
        source = photoRef.current;
        w = photoRef.current.naturalWidth;
        h = photoRef.current.naturalHeight;
      }
      if (!source) return;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      if (!scratchRef.current) scratchRef.current = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const s = settingsRef.current;
      const result = renderStage({
        ctx,
        source,
        w,
        h,
        mirrored: m === "camera" && s.mirror,
        landmarks: landmarksRef.current,
        mask: maskRef.current,
        upper: upperRef.current,
        lower: lowerRef.current,
        settings: s,
        scratch: scratchRef.current,
      });
      const wanted = (upperRef.current ? 1 : 0) + (lowerRef.current ? 1 : 0);
      const got = (result.upperFitted ? 1 : 0) + (result.lowerFitted ? 1 : 0);
      const t = !landmarksRef.current ? "none" : got < wanted ? "partial" : "ok";
      if (t !== trackingRef.current) {
        trackingRef.current = t;
        setTracking(t);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---------- capture ----------
  const snapshot = () => canvasRef.current?.toDataURL("image/jpeg", 0.92) ?? null;

  const capture = () => {
    const url = snapshot();
    if (!url) return;
    downloadDataUrl(url, `tryme-look-${Date.now()}.jpg`);
  };

  const save = async () => {
    const url = snapshot();
    if (!url) return;
    setSaving(true);
    try {
      await saveLook({ image: url, garments: [upper?.name, lower?.name].filter(Boolean) as string[] });
      toast.success("Saved to My Looks");
    } catch {
      toast.error("Couldn't save this look on your device.");
    } finally {
      setSaving(false);
    }
  };

  const activeIds = [upper, lower].filter(Boolean).map((g) => `${g!.id}:${g!.category}`);
  const live = mode !== "none";

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="order-2 min-w-0 lg:order-1">
        <GarmentPicker uploads={uploads} activeIds={activeIds} onWear={wear} onAddUpload={addUpload} />
      </div>

      <div className="order-1 min-w-0 space-y-4 lg:order-2">
        {/* Stage */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-stage text-stage-foreground shadow-lift">
          <div className="relative flex aspect-[3/4] w-full items-center justify-center sm:aspect-[4/3]">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 h-full w-full object-contain ${live ? "block" : "hidden"}`}
              aria-label="Live try-on preview"
            />

            {settings.compare && live && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.compareX}
                onChange={(e) => patch({ compareX: Number(e.target.value) })}
                aria-label="Before and after divider"
                className="absolute inset-x-6 bottom-20 accent-lavender"
              />
            )}

            {!live && (
              <StageIntro
                status={camStatus}
                onStart={() => void startCamera()}
                onPhoto={() => photoInputRef.current?.click()}
              />
            )}

            {live && (
              <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                  <span
                    className={`h-2 w-2 rounded-full ${tracking === "ok" ? "bg-success" : tracking === "partial" ? "bg-lavender" : "bg-destructive"}`}
                  />
                  {visionStatus === "loading"
                    ? "Loading body tracking…"
                    : tracking === "ok"
                      ? "Outfit fitted to you"
                      : tracking === "partial"
                        ? "Step back so your hips are visible"
                        : "Stand in view, facing the camera"}
                </span>
                {mode === "camera" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/80 px-3 py-1.5 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive-foreground" /> LIVE
                  </span>
                )}
              </div>
            )}

            {visionStatus === "loading" && live && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/30 backdrop-blur-[2px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>

          {/* Toolbar */}
          {live && (
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-t from-ink/70 to-transparent px-4 pb-4 pt-10">
              {mode === "camera" ? (
                <Button variant="stage" size="iconLg" onClick={() => { stopCamera(); setMode("none"); setCamStatus("idle"); }} aria-label="Stop camera">
                  <CameraOff />
                </Button>
              ) : (
                <Button variant="stage" size="iconLg" onClick={() => void startCamera()} aria-label="Open live camera">
                  <Camera />
                </Button>
              )}
              {mode === "camera" && (
                <Button variant="stage" size="iconLg" onClick={switchCamera} aria-label="Switch camera">
                  <SwitchCamera />
                </Button>
              )}
              <Button variant="stage" size="iconLg" onClick={() => photoInputRef.current?.click()} aria-label="Use a photo of me">
                <ImageUp />
              </Button>
              <Button variant="stage" size="iconLg" onClick={() => patch({ zoom: Math.max(1, +(settings.zoom - 0.25).toFixed(2)) })} aria-label="Zoom out">
                <Minus />
              </Button>
              <span className="hidden min-w-10 text-center text-xs tabular-nums sm:inline">{settings.zoom.toFixed(2)}×</span>
              <Button variant="stage" size="iconLg" onClick={() => patch({ zoom: Math.min(2.5, +(settings.zoom + 0.25).toFixed(2)) })} aria-label="Zoom in">
                <Plus />
              </Button>
              <Button variant={settings.compare ? "stageActive" : "stage"} size="iconLg" onClick={() => patch({ compare: !settings.compare })} aria-label="Before and after">
                <SplitSquareHorizontal />
              </Button>
              <Button variant="lavender" size="xl" onClick={capture} className="px-4 sm:ml-1 sm:px-7" aria-label="Capture">
                <Download /> <span className="hidden sm:inline">Capture</span>
              </Button>
              <Button variant="stage" size="xl" onClick={() => void save()} disabled={saving} className="px-4 sm:px-7" aria-label="Save look">
                <Heart /> <span className="hidden sm:inline">Save look</span>
              </Button>
            </div>
          )}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void usePhoto(f);
            e.target.value = "";
          }}
        />

        {/* Fit controls */}
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_260px]">
          <SlotCard
            title="Top / full outfit"
            garment={upper}
            fit={settings.fitUpper}
            onFit={(f) => patch({ fitUpper: f })}
            onRemove={() => setUpper(null)}
            onRecategorize={(c) => upper && void recategorize(upper, c)}
          />
          <SlotCard
            title="Bottom"
            garment={lower}
            fit={settings.fitLower}
            onFit={(f) => patch({ fitLower: f })}
            onRemove={() => setLower(null)}
            onRecategorize={(c) => lower && void recategorize(lower, c)}
          />
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <ToggleRow
              id="hide"
              label="Hide my own clothes"
              hint="Only the new outfit shows"
              checked={settings.hideClothes}
              onChange={(v) => patch({ hideClothes: v })}
            />
            <ToggleRow id="mirror" label="Mirror view" checked={settings.mirror} onChange={(v) => patch({ mirror: v })} icon={<FlipHorizontal2 className="h-3.5 w-3.5" />} />
            <ToggleRow id="points" label="Show body tracking" checked={settings.showPoints} onChange={(v) => patch({ showPoints: v })} icon={<ScanLine className="h-3.5 w-3.5" />} />
            <Button variant="soft" size="sm" className="w-full" onClick={() => setSettings((s) => ({ ...DEFAULT_SETTINGS, mirror: s.mirror }))}>
              <RotateCcw /> Reset fit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageIntro({ status, onStart, onPhoto }: { status: CamStatus; onStart: () => void; onPhoto: () => void }) {
  return (
    <div className="flex max-w-md flex-col items-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lavender/20 ring-1 ring-lavender/40">
        <Camera className="h-7 w-7" />
      </div>
      <h2 className="text-4xl sm:text-5xl">Step into the mirror</h2>
      <p className="mt-3 text-sm text-stage-foreground/70">
        {status === "denied"
          ? "Camera access was blocked. Allow the camera in your browser's address bar, then try again — or upload a photo."
          : status === "error"
            ? "We couldn't open a camera on this device. You can still upload a photo of yourself."
            : "Stand about 1.5 m back so your shoulders and hips are in view. Video stays on your device."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button variant="lavender" size="xl" onClick={onStart} disabled={status === "requesting"}>
          {status === "requesting" ? <Loader2 className="animate-spin" /> : status === "denied" ? <RefreshCcw /> : <Camera />}
          {status === "requesting" ? "Waiting for permission…" : status === "denied" ? "Try camera again" : "Open live camera"}
        </Button>
        <Button variant="stage" size="xl" onClick={onPhoto}>
          <ImageUp /> Upload my photo
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="flex flex-col gap-0.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SlotCard({
  title,
  garment,
  fit,
  onFit,
  onRemove,
  onRecategorize,
}: {
  title: string;
  garment: LoadedGarment | null;
  fit: { scale: number; offsetY: number };
  onFit: (f: { scale: number; offsetY: number }) => void;
  onRemove: () => void;
  onRecategorize: (c: Category) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        {garment && (
          <button onClick={onRemove} className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Remove ${garment.name}`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {garment ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="checkerboard flex h-14 w-14 shrink-0 items-center justify-center rounded-xl p-1">
              <img src={garment.src} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{garment.name}</p>
              {garment.uploaded ? (
                <select
                  value={garment.category}
                  onChange={(e) => onRecategorize(e.target.value as Category)}
                  className="mt-1 rounded-md border bg-background px-2 py-0.5 text-xs"
                  aria-label="Outfit type"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted-foreground">{garment.category}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Size</span>
              <span className="tabular-nums">{Math.round(fit.scale * 100)}%</span>
            </div>
            <Slider min={0.75} max={1.45} step={0.01} value={[fit.scale]} onValueChange={([v]) => onFit({ ...fit, scale: v ?? 1 })} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Position</span>
              <span className="tabular-nums">{fit.offsetY > 0 ? "lower" : fit.offsetY < 0 ? "higher" : "auto"}</span>
            </div>
            <Slider min={-0.5} max={0.5} step={0.01} value={[fit.offsetY]} onValueChange={([v]) => onFit({ ...fit, offsetY: v ?? 0 })} />
          </div>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Pick an item from the list to wear it here.</p>
      )}
    </div>
  );
}
