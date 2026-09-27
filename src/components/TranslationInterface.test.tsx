import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TranslationInterface from "./TranslationInterface";
import { defaultSettings } from "@/lib/settings";
import type { HandFrame } from "@/hooks/use-hand-tracking";

// Replace the camera with a stub so tests can feed hand-tracking frames directly.
let sendFrame: (frame: HandFrame) => void = () => {};
vi.mock("./CameraFeed", () => ({
  default: ({ onHandFrame }: { onHandFrame: (frame: HandFrame) => void }) => {
    sendFrame = onHandFrame;
    return null;
  },
}));

const renderInterface = (language = "english", onBack = vi.fn()) =>
  render(
    <TranslationInterface
      language={language}
      settings={defaultSettings}
      onSettingsChange={vi.fn()}
      onBack={onBack}
    />,
  );

// Holds a sign for `ms`, sending a frame every 100ms from `start`.
const hold = (gesture: HandFrame["gesture"], start: number, ms = 1000) => {
  for (let t = start; t <= start + ms; t += 100) {
    act(() => sendFrame({ handPresent: gesture !== null, gesture, confidence: 95, timestamp: t }));
  }
};

describe("TranslationInterface", () => {
  afterEach(cleanup);

  it("adds a phrase when a sign is held", () => {
    renderInterface();
    hold("open_palm", 0);
    expect(screen.getByText("Hello!")).toBeTruthy();
  });

  it("adds a held sign only once, then again after the hand changes", () => {
    renderInterface();
    hold("victory", 0, 3000);
    expect(screen.getByText("Thank you.")).toBeTruthy();
    hold(null, 3100, 200);
    hold("victory", 3400);
    expect(screen.getByText("Thank you. Thank you.")).toBeTruthy();
  });

  it("uses the chosen output language", () => {
    renderInterface("hindi");
    hold("thumbs_up", 0);
    expect(screen.getByText("हाँ।")).toBeTruthy();
  });

  it("clears the output", () => {
    renderInterface();
    hold("fist", 0);
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByText(/translated text will appear here/i)).toBeTruthy();
  });

  it("calls onBack instead of reloading", () => {
    const onBack = vi.fn();
    renderInterface("english", onBack);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
