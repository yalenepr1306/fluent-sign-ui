import { useState } from "react";
import { Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TranslationInterface from "@/components/TranslationInterface";

const Index = () => {
  const [started, setStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  if (started) {
    return <TranslationInterface language={selectedLanguage} />;
  }

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-6">
      <div className="w-full max-w-2xl slide-up">
        <div className="text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-card rounded-full p-8 shadow-medium">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Sign Language Translator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Bridge communication gaps with real-time AI-powered sign language translation
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-4 max-w-md mx-auto">
            <label className="flex items-center gap-2 text-lg font-medium justify-center">
              <Languages className="w-5 h-5 text-primary" />
              Select Output Language
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-14 text-lg shadow-soft border-2 hover:border-primary transition-smooth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english" className="text-lg py-3">English</SelectItem>
                <SelectItem value="hindi" className="text-lg py-3">हिंदी (Hindi)</SelectItem>
                <SelectItem value="tamil" className="text-lg py-3">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="spanish" className="text-lg py-3">Español (Spanish)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <Button
              onClick={() => setStarted(true)}
              size="lg"
              className="h-16 px-12 text-xl font-semibold gradient-primary shadow-glow hover:shadow-medium transition-smooth hover:scale-105"
            >
              Start Translating
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-sm">
            <div className="bg-card p-4 rounded-2xl shadow-soft">
              <div className="font-semibold text-primary mb-1">Real-Time</div>
              <div className="text-muted-foreground">Instant gesture recognition</div>
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-soft">
              <div className="font-semibold text-secondary mb-1">Accessible</div>
              <div className="text-muted-foreground">High contrast, large text</div>
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-soft">
              <div className="font-semibold text-accent mb-1">AI-Powered</div>
              <div className="text-muted-foreground">Advanced ML detection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
