import { describe, expect, it } from "vitest";
import { classifyGesture, GestureStabilizer, phraseFor, type Point } from "./gestures";

// Builds a flat, upright right hand in image coordinates (y grows downwards).
// `fingers` = [thumb, index, middle, ring, pinky], true when extended.
const makeHand = (fingers: boolean[]): Point[] => {
  const hand: Point[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
  hand[0] = { x: 0.5, y: 0.9 };

  const [thumb, ...rest] = fingers;
  hand[1] = { x: 0.38, y: 0.84 };
  hand[2] = { x: 0.28, y: 0.74 };
  if (thumb) {
    hand[3] = { x: 0.2, y: 0.6 };
    hand[4] = { x: 0.12, y: 0.45 };
  } else {
    // Folded across the palm.
    hand[3] = { x: 0.32, y: 0.68 };
    hand[4] = { x: 0.42, y: 0.68 };
  }

  [0.35, 0.45, 0.55, 0.65].forEach((x, i) => {
    const base = 5 + i * 4;
    hand[base] = { x, y: 0.6 };
    if (rest[i]) {
      hand[base + 1] = { x, y: 0.5 };
      hand[base + 2] = { x, y: 0.43 };
      hand[base + 3] = { x, y: 0.36 };
    } else {
      hand[base + 1] = { x, y: 0.52 };
      hand[base + 2] = { x, y: 0.58 };
      hand[base + 3] = { x, y: 0.66 };
    }
  });
  return hand;
};

describe("classifyGesture", () => {
  it.each([
    ["open_palm", [true, true, true, true, true]],
    ["thumbs_up", [true, false, false, false, false]],
    ["fist", [false, false, false, false, false]],
    ["victory", [false, true, true, false, false]],
    ["pointing", [false, true, false, false, false]],
    ["i_love_you", [true, true, false, false, true]],
  ])("recognises %s", (expected, fingers) => {
    expect(classifyGesture(makeHand(fingers))).toBe(expected);
  });

  it("returns null for an unknown hand shape", () => {
    expect(classifyGesture(makeHand([false, false, false, true, true]))).toBeNull();
  });

  it("returns null when landmarks are missing", () => {
    expect(classifyGesture([])).toBeNull();
  });

  it("does not call a sideways thumb a thumbs up", () => {
    const hand = makeHand([true, false, false, false, false]);
    hand[4] = { x: 0.05, y: 0.8 };
    hand[3] = { x: 0.15, y: 0.78 };
    expect(classifyGesture(hand)).not.toBe("thumbs_up");
  });
});

describe("GestureStabilizer", () => {
  it("emits a sign once it is held long enough", () => {
    const s = new GestureStabilizer(800);
    expect(s.feed("victory", 0)).toBeNull();
    expect(s.feed("victory", 500)).toBeNull();
    expect(s.feed("victory", 800)).toBe("victory");
  });

  it("does not repeat a sign that is still being held", () => {
    const s = new GestureStabilizer(800);
    s.feed("fist", 0);
    s.feed("fist", 900);
    expect(s.feed("fist", 5000)).toBeNull();
  });

  it("emits the same sign again after the hand changes", () => {
    const s = new GestureStabilizer(800);
    s.feed("fist", 0);
    s.feed("fist", 900);
    s.feed(null, 1000);
    s.feed("fist", 1100);
    expect(s.feed("fist", 1900)).toBe("fist");
  });

  it("ignores a sign that flickers before the hold time", () => {
    const s = new GestureStabilizer(800);
    s.feed("pointing", 0);
    s.feed("victory", 400);
    expect(s.feed("pointing", 900)).toBeNull();
  });
});

describe("phraseFor", () => {
  it("uses the chosen language and falls back to English", () => {
    expect(phraseFor("open_palm", "spanish")).toBe("¡Hola!");
    expect(phraseFor("open_palm", "klingon")).toBe("Hello!");
  });
});
