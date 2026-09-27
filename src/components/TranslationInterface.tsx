import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraFeed from "./CameraFeed";
import TextOutput from "./TextOutput";
import ControlPanel from "./ControlPanel";
import SettingsPanel from "./SettingsPanel";
import type { Settings as AppSettings } from "@/lib/settings";
import { GestureStabilizer, phraseFor, type GestureId } from "@/lib/gestures";
import type { HandFrame } from "@/hooks/use-hand-tracking";

interface TranslationInterfaceProps {
  language: string;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onBack: () => void;
}

const TranslationInterface = ({ language, settings, onSettingsChange, onBack }: TranslationInterfaceProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const stabilizer = useRef(new GestureStabilizer());
  const [liveGesture, setLiveGesture] = useState<GestureId | null>(null);
  const [handPresent, setHandPresent] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleStart = () => {
    setIsTranslating(true);
  };

  const handlePause = () => {
    setIsTranslating(false);
    stabilizer.current.reset();
    setLiveGesture(null);
    setHandPresent(false);
    setConfidence(0);
  };

  const handleClear = () => {
    setTranslatedText("");
    setConfidence(0);
    stabilizer.current.reset();
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Called for every analysed camera frame. A sign held steadily adds its phrase once.
  const handleHandFrame = useCallback(
    (frame: HandFrame) => {
      setHandPresent(frame.handPresent);
      setLiveGesture(frame.gesture);
      setConfidence(Math.round(frame.confidence));

      const emitted = stabilizer.current.feed(frame.gesture, frame.timestamp);
      if (emitted) {
        const phrase = phraseFor(emitted, language);
        setTranslatedText((prev) => prev + (prev ? " " : "") + phrase);
      }
    },
    [language],
  );

  return (
    <div className="min-h-screen gradient-soft p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="shadow-soft hover:shadow-medium transition-smooth"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size="lg"
          className="shadow-soft hover:shadow-medium transition-smooth"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="fade-in">
            <CameraFeed
              confidence={confidence}
              isActive={isTranslating}
              facingMode={facingMode}
              language={language}
              liveGesture={liveGesture}
              handPresent={handPresent}
              onHandFrame={handleHandFrame}
            />
          </div>

          {/* Text Output */}
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <TextOutput
              text={translatedText}
              language={language}
              confidence={confidence}
              voiceSpeed={settings.voiceSpeed}
              voicePitch={settings.voicePitch}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="mt-6 fade-in" style={{ animationDelay: "0.2s" }}>
          <ControlPanel
            isTranslating={isTranslating}
            onStart={handleStart}
            onPause={handlePause}
            onClear={handleClear}
            onSwitchCamera={handleSwitchCamera}
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 fade-in">
            <SettingsPanel
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationInterface;
