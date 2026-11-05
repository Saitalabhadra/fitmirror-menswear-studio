<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Try-on fitting geometry lives in `src/lib/fit.ts` as pure TS (no React/DOM) with tests in `src/lib/fit.test.ts`; tune fit via the `FIT` constants and per-garment `anchors`, not inside components. Why: fit logic changes often and must stay testable.
- Per-frame camera state (landmarks, masks, video timestamps) lives in refs read by one rAF loop in `TryOnStudio`; React state holds only UI. Why: setState per frame re-renders 60×/s.
- MediaPipe (`@mediapipe/tasks-vision`) is imported dynamically in `src/lib/vision.ts`; the WASM CDN version must match the installed package version. Why: browser-only library; SSR imports break.
- Garment URL import goes through the `importGarmentFromUrl` server function (SSRF-guarded, returns a data URL). Why: browsers block cross-site image reads (CORS) and tainted canvases can't be captured.
- Saved looks use IndexedDB (`src/lib/looks-store.ts`), not localStorage. Why: photo data URLs exceed localStorage limits.
