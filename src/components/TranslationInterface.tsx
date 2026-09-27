import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraFeed from "./CameraFeed";
import TextOutput from "./TextOutput";
import ControlPanel from "./ControlPanel";
import SettingsPanel from "./SettingsPanel";

interface TranslationInterfaceProps {
  language: string;
}

const demoWords = ["Hello", "How are you?", "Thank you", "Good morning", "I am fine"];

const TranslationInterface = ({ language }: TranslationInterfaceProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const demoIndex = useRef(0);
  const [translatedText, setTranslatedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    signLanguage: "asl",
    darkMode: false,
    voiceSpeed: "normal",
    voicePitch: "normal"
  });

  const handleStart = () => {
    setIsTranslating(true);
  };

  const handlePause = () => {
    setIsTranslating(false);
  };

  const handleClear = () => {
    setTranslatedText("");
    setConfidence(0);
    demoIndex.current = 0;
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleBack = () => {
    window.location.reload();
  };

  // Simulate real-time translation for demo. Runs only while translating and
  // resumes from where it left off after a pause.
  useEffect(() => {
    if (!isTranslating) return;

    const interval = setInterval(() => {
      if (demoIndex.current >= demoWords.length) {
        clearInterval(interval);
        return;
      }
      const word = demoWords[demoIndex.current];
      demoIndex.current++;
      setTranslatedText((prev) => prev + (prev ? " " : "") + word);
      setConfidence(Math.random() * 20 + 80); // 80-100% confidence
    }, 2000);

    return () => clearInterval(interval);
  }, [isTranslating]);

  return (
    <div className="min-h-screen gradient-soft p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Button
          onClick={handleBack}
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
            <CameraFeed confidence={confidence} isActive={isTranslating} facingMode={facingMode} />
          </div>

          {/* Text Output */}
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <TextOutput
              text={translatedText}
              language={language}
              confidence={confidence}
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
              onSettingsChange={setSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationInterface;
