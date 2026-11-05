/**
 * Lazy loader for MediaPipe body tracking (pose) and clothing segmentation.
 * Browser-only: the library is imported dynamically on first use.
 */
import type { ImageSegmenter, PoseLandmarker } from "@mediapipe/tasks-vision";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const SEG_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

/** Category index for "clothes" in the selfie multiclass model. */
export const CLOTHES_CLASS = 4;

export interface Vision {
  pose: PoseLandmarker;
  seg: ImageSegmenter | null;
  mode: "VIDEO" | "IMAGE";
}

let pending: Promise<Vision> | null = null;

export function loadVision(): Promise<Vision> {
  if (pending) return pending;
  pending = (async () => {
    const mp = await import("@mediapipe/tasks-vision");
    const fileset = await mp.FilesetResolver.forVisionTasks(WASM);
    const makePose = (delegate: "GPU" | "CPU") =>
      mp.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    let pose: PoseLandmarker;
    try {
      pose = await makePose("GPU");
    } catch {
      pose = await makePose("CPU");
    }
    let seg: ImageSegmenter | null = null;
    try {
      seg = await mp.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: SEG_MODEL, delegate: "CPU" },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
    } catch (e) {
      console.warn("Clothing segmentation unavailable", e);
    }
    return { pose, seg, mode: "VIDEO" as const };
  })();
  pending.catch(() => {
    pending = null;
  });
  return pending;
}

export async function setVisionMode(v: Vision, mode: "VIDEO" | "IMAGE") {
  if (v.mode === mode) return;
  await v.pose.setOptions({ runningMode: mode });
  if (v.seg) await v.seg.setOptions({ runningMode: mode });
  v.mode = mode;
}
