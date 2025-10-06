import { Play, Pause, RotateCcw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlPanelProps {
  isTranslating: boolean;
  onStart: () => void;
  onPause: () => void;
  onClear: () => void;
}

const ControlPanel = ({ isTranslating, onStart, onPause, onClear }: ControlPanelProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-medium p-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Start/Pause Button */}
        {!isTranslating ? (
          <Button
            onClick={onStart}
            size="lg"
            className="h-16 px-8 text-lg gradient-primary shadow-glow hover:shadow-medium transition-smooth hover:scale-105"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Translation
          </Button>
        ) : (
          <Button
            onClick={onPause}
            size="lg"
            variant="secondary"
            className="h-16 px-8 text-lg shadow-soft hover:shadow-medium transition-smooth"
          >
            <Pause className="w-6 h-6 mr-2" />
            Pause
          </Button>
        )}

        {/* Clear Button */}
        <Button
          onClick={onClear}
          size="lg"
          variant="outline"
          className="h-16 px-8 text-lg shadow-soft hover:shadow-medium transition-smooth"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          Clear
        </Button>

        {/* Switch Camera Button (placeholder) */}
        <Button
          size="lg"
          variant="outline"
          className="h-16 px-8 text-lg shadow-soft hover:shadow-medium transition-smooth"
        >
          <Camera className="w-6 h-6 mr-2" />
          Switch Camera
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
