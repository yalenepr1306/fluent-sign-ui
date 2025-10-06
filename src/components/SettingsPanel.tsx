import { Moon, Sun, Volume2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Settings {
  signLanguage: string;
  darkMode: boolean;
  voiceSpeed: string;
  voicePitch: string;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  const updateSetting = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-card rounded-3xl shadow-medium p-6 slide-up">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-primary">⚙️</span>
        Settings
      </h3>

      <div className="space-y-6">
        {/* Sign Language Dataset */}
        <div className="space-y-2">
          <Label htmlFor="sign-language" className="text-base font-semibold">
            Sign Language Dataset
          </Label>
          <Select
            value={settings.signLanguage}
            onValueChange={(value) => updateSetting("signLanguage", value)}
          >
            <SelectTrigger id="sign-language" className="h-12 shadow-soft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asl">American Sign Language (ASL)</SelectItem>
              <SelectItem value="isl">Indian Sign Language (ISL)</SelectItem>
              <SelectItem value="bsl">British Sign Language (BSL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Speed */}
        <div className="space-y-2">
          <Label htmlFor="voice-speed" className="text-base font-semibold flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            Voice Speed
          </Label>
          <Select
            value={settings.voiceSpeed}
            onValueChange={(value) => updateSetting("voiceSpeed", value)}
          >
            <SelectTrigger id="voice-speed" className="h-12 shadow-soft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Pitch */}
        <div className="space-y-2">
          <Label htmlFor="voice-pitch" className="text-base font-semibold">
            Voice Pitch
          </Label>
          <Select
            value={settings.voicePitch}
            onValueChange={(value) => updateSetting("voicePitch", value)}
          >
            <SelectTrigger id="voice-pitch" className="h-12 shadow-soft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
          <Label htmlFor="dark-mode" className="text-base font-semibold flex items-center gap-2 cursor-pointer">
            {settings.darkMode ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-secondary" />
            )}
            Dark Mode
          </Label>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => updateSetting("darkMode", checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
