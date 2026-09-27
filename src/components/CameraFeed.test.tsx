import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CameraFeed from "./CameraFeed";

const props = {
  confidence: 0,
  facingMode: "user" as const,
  language: "english",
  liveGesture: null,
  handPresent: false,
  onHandFrame: vi.fn(),
};

describe("CameraFeed", () => {
  afterEach(cleanup);

  it("explains when the browser has no camera support", () => {
    render(<CameraFeed {...props} isActive />);
    expect(screen.getByText(/camera is not supported/i)).toBeTruthy();
  });

  it("lists the supported signs in the chosen language", () => {
    render(<CameraFeed {...props} isActive={false} language="spanish" />);
    expect(screen.getByText("¡Hola!")).toBeTruthy();
    expect(screen.getByText("Te quiero.")).toBeTruthy();
  });
});
