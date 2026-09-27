import { Volume2, Copy, CheckCircle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  languageNames,
  pickVoice,
  speechLangs,
  speechPitches,
  speechRates,
  splitSentences,
} from "@/lib/speech";

interface TextOutputProps {
  text: string;
  language: string;
  confidence: number;
  voiceSpeed: string;
  voicePitch: string;
}

const TextOutput = ({ text, language, confidence, voiceSpeed, voicePitch }: TextOutputProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Keeps queued utterances referenced; Chrome can drop events for ones that get garbage collected.
  const utterances = useRef<SpeechSynthesisUtterance[]>([]);
  const { toast } = useToast();
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Browsers load their voice list asynchronously, so listen for it to arrive.
  useEffect(() => {
    if (!speechSupported) return;
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener?.("voiceschanged", update);
    return () => synth.removeEventListener?.("voiceschanged", update);
  }, [speechSupported]);

  const stopSpeaking = () => {
    if (speechSupported) window.speechSynthesis.cancel();
    utterances.current = [];
    setIsSpeaking(false);
  };

  // Stop speaking when the text is cleared or the screen is left.
  useEffect(() => {
    if (!speechSupported || text) return;
    window.speechSynthesis.cancel();
    utterances.current = [];
    setIsSpeaking(false);
  }, [text, speechSupported]);

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, [speechSupported]);

  const handleSpeak = () => {
    if (!text) return;
    if (!speechSupported) {
      toast({
        title: "Speech not available",
        description: "This browser can't read text aloud",
        variant: "destructive",
      });
      return;
    }

    const synth = window.speechSynthesis;
    const langTag = speechLangs[language] ?? "en-US";
    const available = voices.length ? voices : synth.getVoices();
    const voice = pickVoice(available, langTag);

    // With a voice list but no voice for this language, the browser would stay silent.
    if (available.length && !voice) {
      toast({
        title: `No ${languageNames[language] ?? language} voice on this device`,
        description: "Install one in your system's speech or language settings, or try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Clear anything queued and un-pause the engine; Chrome can get stuck paused.
    synth.cancel();
    synth.resume();

    const sentences = splitSentences(text);
    const queue = sentences.map((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = langTag;
      if (voice) utterance.voice = voice;
      utterance.rate = speechRates[voiceSpeed] ?? 1;
      utterance.pitch = speechPitches[voicePitch] ?? 1;
      if (i === sentences.length - 1) {
        utterance.onend = () => {
          utterances.current = [];
          setIsSpeaking(false);
        };
      }
      utterance.onerror = (event) => {
        utterances.current = [];
        setIsSpeaking(false);
        // Cancelling (Stop, Clear, Back) also reports an error; that one is expected.
        if (event.error !== "canceled" && event.error !== "interrupted") {
          toast({
            title: "Couldn't read the text aloud",
            description: `The browser reported: ${event.error}`,
            variant: "destructive",
          });
        }
      };
      return utterance;
    });

    utterances.current = queue;
    setIsSpeaking(true);
    queue.forEach((utterance) => synth.speak(utterance));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access",
        variant: "destructive",
      });
    }
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
      <div className="flex-1 p-6 overflow-y-auto" aria-live="polite">
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
            onClick={isSpeaking ? stopSpeaking : handleSpeak}
            disabled={!text}
            size="lg"
            className="flex-1 gradient-primary shadow-soft hover:shadow-medium transition-smooth"
          >
            {isSpeaking ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Speak
              </>
            )}
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!text}
            variant="outline"
            size="lg"
            aria-label="Copy text"
            title="Copy text"
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
