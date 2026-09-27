import { useEffect, useRef, useState, type RefObject } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import wasmLoaderPath from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import wasmBinaryPath from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";
import { classifyGesture, type GestureId } from "@/lib/gestures";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type HandTrackingStatus = "idle" | "loading" | "ready" | "error";

export interface HandFrame {
  handPresent: boolean;
  gesture: GestureId | null;
  // Detection confidence, 0-100.
  confidence: number;
  timestamp: number;
}

// The model is large, so load it once and share it across camera sessions.
let landmarkerPromise: Promise<HandLandmarker> | null = null;

const loadLandmarker = () => {
  landmarkerPromise ??= (async () => {
    const { HandLandmarker } = await import("@mediapipe/tasks-vision");
    const create = (delegate: "GPU" | "CPU") =>
      HandLandmarker.createFromOptions(
        { wasmLoaderPath, wasmBinaryPath },
        {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO",
          numHands: 1,
        },
      );
    try {
      return await create("GPU");
    } catch {
      return await create("CPU");
    }
  })().catch((err) => {
    landmarkerPromise = null; // Allow a retry on the next start.
    throw err;
  });
  return landmarkerPromise;
};

export const useHandTracking = (
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled: boolean,
  onFrame: (frame: HandFrame) => void,
) => {
  const [status, setStatus] = useState<HandTrackingStatus>("idle");
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    let frameId = 0;
    const overlay = canvasRef.current;
    setStatus("loading");

    loadLandmarker()
      .then(async (landmarker) => {
        if (cancelled) return;
        const { DrawingUtils, HandLandmarker } = await import("@mediapipe/tasks-vision");
        if (cancelled) return;
        setStatus("ready");

        let lastVideoTime = -1;
        const loop = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            const now = performance.now();
            const result = landmarker.detectForVideo(video, now);

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);

            const hand = result.landmarks[0];
            if (hand && ctx) {
              const draw = new DrawingUtils(ctx);
              draw.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#2cc5c5", lineWidth: 4 });
              draw.drawLandmarks(hand, { color: "#ffffff", fillColor: "#4a90e8", radius: 4 });
            }

            onFrameRef.current({
              handPresent: Boolean(hand),
              gesture: hand ? classifyGesture(hand) : null,
              confidence: hand ? (result.handedness[0]?.[0]?.score ?? 0) * 100 : 0,
              timestamp: now,
            });
          }
          frameId = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      overlay?.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    };
  }, [enabled, videoRef, canvasRef]);

  return status;
};
