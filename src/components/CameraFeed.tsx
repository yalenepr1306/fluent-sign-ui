import { Camera, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CameraFeedProps {
  confidence: number;
  isActive: boolean;
}

const CameraFeed = ({ confidence, isActive }: CameraFeedProps) => {
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
        {isActive ? (
          <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10">
            {/* Simulated camera feed with hand detection overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 border-4 border-primary rounded-2xl opacity-50 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-24 h-24 text-primary animate-pulse" />
                </div>
              </div>
            </div>
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
