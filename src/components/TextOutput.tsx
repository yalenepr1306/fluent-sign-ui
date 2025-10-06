import { Volume2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TextOutputProps {
  text: string;
  language: string;
  confidence: number;
}

const TextOutput = ({ text, language, confidence }: TextOutputProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleSpeak = () => {
    if (!text) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hindi" ? "hi-IN" : language === "tamil" ? "ta-IN" : "en-US";
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="bg-card rounded-3xl shadow-medium overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-accent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-lg">Translation Output</span>
          </div>
          {confidence > 0 && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-medium">{confidence.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Display */}
      <div className="flex-1 p-6 overflow-y-auto">
        {text ? (
          <div className="space-y-4">
            <div className="text-3xl md:text-4xl font-semibold leading-relaxed text-foreground slide-up">
              {text}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-xl text-center">
              Translated text will appear here in real-time
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-3">
          <Button
            onClick={handleSpeak}
            disabled={!text || isSpeaking}
            size="lg"
            className="flex-1 gradient-primary shadow-soft hover:shadow-medium transition-smooth"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            {isSpeaking ? "Speaking..." : "Speak"}
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!text}
            variant="outline"
            size="lg"
            className="shadow-soft hover:shadow-medium transition-smooth"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextOutput;
