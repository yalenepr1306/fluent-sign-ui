import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Hand, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useHandTracking, type HandFrame } from "@/hooks/use-hand-tracking";
import { gestures, phraseFor, type GestureId } from "@/lib/gestures";

interface CameraFeedProps {
  confidence: number;
  isActive: boolean;
  facingMode: "user" | "environment";
  language: string;
  liveGesture: GestureId | null;
  handPresent: boolean;
  onHandFrame: (frame: HandFrame) => void;
}

const CameraFeed = ({
  confidence,
  isActive,
  facingMode,
  language,
  liveGesture,
  handPresent,
  onHandFrame,
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const trackingStatus = useHandTracking(videoRef, canvasRef, isActive && streaming && !error, onHandFrame);
  const live = gestures.find((g) => g.id === liveGesture);

  // Open the camera while active; stop every track when paused, switched or unmounted.
  useEffect(() => {
    if (!isActive) return;

    const video = videoRef.current;
    let stream: MediaStream | null = null;
    let cancelled = false;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported in this browser");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode }, audio: false })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        if (video) {
          video.srcObject = mediaStream;
        }
        setStreaming(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        setError(
          name === "NotAllowedError"
            ? "Camera permission was denied"
            : name === "NotFoundError"
              ? "No camera was found"
              : "Could not start the camera"
        );
      });

    return () => {
      cancelled = true;
      setStreaming(false);
      stream?.getTracks().forEach((track) => track.stop());
      if (video) {
        video.srcObject = null;
      }
    };
  }, [isActive, facingMode]);

  return (
    <div className="bg-card rounded-3xl shadow-medium overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span className="font-semibold text-lg">Camera Feed</span>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 pulse-subtle">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera Display Area */}
      <div className="relative aspect-[4/3] sm:aspect-video bg-muted flex items-center justify-center">
        {isActive && error ? (
          <div className="text-center p-8">
            <CameraOff className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg">{error}</p>
          </div>
        ) : isActive ? (
          <div className="relative w-full h-full bg-black">
            {/* Video and landmark overlay share one mirrored box so the drawing lines up. */}
            <div className={`absolute inset-0 ${facingMode === "user" ? "-scale-x-100" : ""}`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Tracking status */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-2 bg-card/95 backdrop-blur rounded-full px-3 py-1.5 text-sm font-medium">
              {trackingStatus === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Loading hand tracking…
                </>
              ) : trackingStatus === "error" ? (
                <span className="text-destructive">Hand tracking failed to load</span>
              ) : live ? (
                <>
                  <span aria-hidden>{live.emoji}</span>
                  {live.label}
                </>
              ) : (
                <>
                  <Hand className="w-4 h-4 text-primary" />
                  {handPresent ? "Hand found, make a sign" : "Show your hand"}
                </>
              )}
            </div>

            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-card/95 backdrop-blur rounded-xl px-3 py-2 sm:p-3">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-sm font-medium">Hand Detection</span>
                <span className="text-sm font-bold text-primary">{confidence.toFixed(0)}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">Camera ready. Press Start to begin translation</p>
          </div>
        )}
      </div>

      {/* Supported signs */}
      <div className="p-4 border-t">
        <p className="text-sm text-muted-foreground text-center mb-3">
          Hold one of these signs steady for a moment to add it
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {gestures.map((g) => (
            <li
              key={g.id}
              title={g.label}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 bg-muted/50 transition-smooth ${
                g.id === liveGesture ? "ring-2 ring-primary" : ""
              }`}
            >
              <span className="text-lg" aria-hidden>
                {g.emoji}
              </span>
              <span className="leading-snug">{phraseFor(g.id, language)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CameraFeed;
