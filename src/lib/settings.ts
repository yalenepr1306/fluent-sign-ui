export interface Settings {
  signLanguage: string;
  darkMode: boolean;
  voiceSpeed: string;
  voicePitch: string;
}

export const defaultSettings: Settings = {
  signLanguage: "asl",
  darkMode: false,
  voiceSpeed: "normal",
  voicePitch: "normal",
};

const SETTINGS_KEY = "fluent-sign-settings";
const LANGUAGE_KEY = "fluent-sign-language";

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.
export const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore; settings still work for this visit.
  }
};

export const loadLanguage = (): string => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) ?? "english";
  } catch {
    return "english";
  }
};

export const saveLanguage = (language: string) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Ignore; the choice still works for this visit.
  }
};
