import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings, loadLanguage, loadSettings, saveLanguage, saveSettings } from "./settings";

describe("settings storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns defaults when nothing is saved", () => {
    expect(loadSettings()).toEqual(defaultSettings);
    expect(loadLanguage()).toBe("english");
  });

  it("round-trips saved settings and language", () => {
    const settings = { ...defaultSettings, darkMode: true, voiceSpeed: "fast" };
    saveSettings(settings);
    saveLanguage("tamil");
    expect(loadSettings()).toEqual(settings);
    expect(loadLanguage()).toBe("tamil");
  });

  it("falls back to defaults when saved data is corrupt", () => {
    localStorage.setItem("fluent-sign-settings", "{not json");
    expect(loadSettings()).toEqual(defaultSettings);
  });
});
