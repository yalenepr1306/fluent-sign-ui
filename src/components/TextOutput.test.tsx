import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextOutput from "./TextOutput";
import { Toaster } from "@/components/ui/toaster";

class FakeUtterance {
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(public text: string) {}
}

let spoken: FakeUtterance[];
let voices: SpeechSynthesisVoice[];
const synth = {
  speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
  cancel: vi.fn(),
  resume: vi.fn(),
  getVoices: () => voices,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const renderOutput = (text: string, language = "english") =>
  render(
    <>
      <TextOutput text={text} language={language} confidence={90} voiceSpeed="fast" voicePitch="low" />
      <Toaster />
    </>,
  );

describe("TextOutput speech", () => {
  beforeEach(() => {
    spoken = [];
    voices = [
      { lang: "en-US", name: "English", localService: true },
      { lang: "hi-IN", name: "Hindi", localService: true },
    ] as SpeechSynthesisVoice[];
    Object.assign(window, { speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance });
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it("reads each sentence with a matching voice and the chosen speed and pitch", () => {
    renderOutput("Hello! Thank you.");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));

    expect(synth.resume).toHaveBeenCalled();
    expect(spoken.map((u) => u.text)).toEqual(["Hello!", "Thank you."]);
    expect(spoken[0].voice?.name).toBe("English");
    expect(spoken[0].lang).toBe("en-US");
    expect(spoken[0].rate).toBe(1.5);
    expect(spoken[0].pitch).toBe(0.7);
  });

  it("uses the voice for the output language", () => {
    renderOutput("नमस्ते!", "hindi");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));
    expect(spoken[0].voice?.name).toBe("Hindi");
  });

  it("switches to Stop while speaking and back to Speak when done", () => {
    renderOutput("Hello! Yes.");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));
    expect(screen.getByRole("button", { name: /stop/i })).toBeTruthy();

    act(() => spoken[1].onend?.());
    expect(screen.getByRole("button", { name: /speak/i })).toBeTruthy();
  });

  it("stops speaking when Stop is pressed", () => {
    renderOutput("Hello!");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));
    synth.cancel.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    expect(synth.cancel).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /speak/i })).toBeTruthy();
  });

  it("explains when the device has no voice for the language", () => {
    renderOutput("வணக்கம்!", "tamil");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));
    expect(spoken).toHaveLength(0);
    expect(screen.getByText(/no tamil voice on this device/i)).toBeTruthy();
  });

  it("recovers and reports a speech error", () => {
    renderOutput("Hello!");
    fireEvent.click(screen.getByRole("button", { name: /speak/i }));
    act(() => spoken[0].onerror?.({ error: "synthesis-failed" }));
    expect(screen.getByRole("button", { name: /speak/i })).toBeTruthy();
    expect(screen.getByText(/synthesis-failed/)).toBeTruthy();
  });
});
