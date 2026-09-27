import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CameraFeedProps {
  confidence: number;
  isActive: boolean;
  facingMode: "user" | "environment";
}

const CameraFeed = ({ confidence, isActive, facingMode }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {isActive && error ? (
          <div className="text-center p-8">
            <CameraOff className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg">{error}</p>
          </div>
        ) : isActive ? (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesture Detection</span>
                <span className="text-sm font-bold text-primary">{confidence.toFixed(1)}%</span>
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

      {/* Info Footer */}
      <div className="p-4 border-t">
        <p className="text-sm text-muted-foreground text-center">
          Position your hand clearly in front of the camera for best results
        </p>
      </div>
    </div>
  );
};

export default CameraFeed;
