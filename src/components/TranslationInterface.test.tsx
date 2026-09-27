import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TranslationInterface from "./TranslationInterface";
import { defaultSettings } from "@/lib/settings";

const renderInterface = (language = "english", onBack = vi.fn()) =>
  render(
    <TranslationInterface
      language={language}
      settings={defaultSettings}
      onSettingsChange={vi.fn()}
      onBack={onBack}
    />,
  );

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("TranslationInterface", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("adds demo phrases while translating", () => {
    renderInterface();
    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    tick(4000);
    expect(screen.getByText("Hello! How are you?")).toBeTruthy();
  });

  it("stops on pause and resumes without duplicating phrases", () => {
    renderInterface();
    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    tick(2000);
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    tick(10000);
    expect(screen.getByText("Hello!")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    tick(2000);
    expect(screen.getByText("Hello! How are you?")).toBeTruthy();
  });

  it("restarts the demo from the first phrase after Clear", () => {
    renderInterface();
    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    tick(4000);
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByText(/translated text will appear here/i)).toBeTruthy();
    tick(2000);
    expect(screen.getByText("Hello!")).toBeTruthy();
  });

  it("shows phrases in the chosen output language", () => {
    renderInterface("spanish");
    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    tick(4000);
    expect(screen.getByText("¡Hola! ¿Cómo estás?")).toBeTruthy();
  });

  it("calls onBack instead of reloading", () => {
    const onBack = vi.fn();
    renderInterface("english", onBack);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("explains when the browser has no camera support", () => {
    renderInterface();
    fireEvent.click(screen.getByRole("button", { name: /start translation/i }));
    expect(screen.getByText(/camera is not supported/i)).toBeTruthy();
  });
});
