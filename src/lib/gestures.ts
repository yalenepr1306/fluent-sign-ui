// Rule-based recognition of a few static hand signs from MediaPipe's 21 hand landmarks.
// Landmark indices: 0 wrist; thumb 1-4; index 5-8; middle 9-12; ring 13-16; pinky 17-20.

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export type GestureId = "open_palm" | "thumbs_up" | "fist" | "victory" | "pointing" | "i_love_you";

export const gestures: { id: GestureId; emoji: string; label: string }[] = [
  { id: "open_palm", emoji: "✋", label: "Open palm" },
  { id: "thumbs_up", emoji: "👍", label: "Thumbs up" },
  { id: "fist", emoji: "✊", label: "Fist" },
  { id: "victory", emoji: "✌️", label: "Victory" },
  { id: "pointing", emoji: "☝️", label: "Pointing" },
  { id: "i_love_you", emoji: "🤟", label: "I love you" },
];

export const gesturePhrases: Record<GestureId, Record<string, string>> = {
  open_palm: { english: "Hello!", hindi: "नमस्ते!", tamil: "வணக்கம்!", spanish: "¡Hola!" },
  thumbs_up: { english: "Yes.", hindi: "हाँ।", tamil: "ஆம்.", spanish: "Sí." },
  fist: { english: "No.", hindi: "नहीं।", tamil: "இல்லை.", spanish: "No." },
  victory: { english: "Thank you.", hindi: "धन्यवाद।", tamil: "நன்றி.", spanish: "Gracias." },
  pointing: {
    english: "I need help.",
    hindi: "मुझे मदद चाहिए।",
    tamil: "எனக்கு உதவி வேண்டும்.",
    spanish: "Necesito ayuda.",
  },
  i_love_you: {
    english: "I love you.",
    hindi: "मुझे तुमसे प्यार है।",
    tamil: "நான் உன்னை நேசிக்கிறேன்.",
    spanish: "Te quiero.",
  },
};

export const phraseFor = (gesture: GestureId, language: string) =>
  gesturePhrases[gesture][language] ?? gesturePhrases[gesture].english;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

// A finger is extended when its tip is clearly farther from the wrist than its middle joint.
// Distances make this independent of how the hand is rotated.
const fingerExtended = (hand: Point[], pip: number, tip: number) =>
  dist(hand[0], hand[tip]) > dist(hand[0], hand[pip]) * 1.15;

const thumbExtended = (hand: Point[]) => {
  const palmSize = dist(hand[0], hand[9]);
  const awayFromIndex = dist(hand[4], hand[5]) > palmSize * 0.5;
  const outsidePalm = dist(hand[4], hand[17]) > dist(hand[3], hand[17]);
  return awayFromIndex && outsidePalm;
};

export const classifyGesture = (hand: Point[]): GestureId | null => {
  if (hand.length < 21) return null;

  const thumb = thumbExtended(hand);
  const index = fingerExtended(hand, 6, 8);
  const middle = fingerExtended(hand, 10, 12);
  const ring = fingerExtended(hand, 14, 16);
  const pinky = fingerExtended(hand, 18, 20);

  if (index && middle && ring && pinky) return "open_palm";
  if (thumb && index && !middle && !ring && pinky) return "i_love_you";
  if (index && middle && !ring && !pinky) return "victory";
  if (index && !middle && !ring && !pinky) return "pointing";
  if (!index && !middle && !ring && !pinky) {
    // Image y grows downwards, so "up" means the tip sits above the thumb's base.
    if (thumb && hand[4].y < hand[2].y) return "thumbs_up";
    if (!thumb) return "fist";
  }
  return null;
};

// Emits a gesture once it has been held steadily for `holdMs`. The same sign is only emitted
// again after the hand changes sign or leaves the frame.
export class GestureStabilizer {
  private current: GestureId | null = null;
  private since = 0;
  private emitted = false;

  constructor(private holdMs = 800) {}

  feed(gesture: GestureId | null, timeMs: number): GestureId | null {
    if (gesture !== this.current) {
      this.current = gesture;
      this.since = timeMs;
      this.emitted = false;
      return null;
    }
    if (gesture && !this.emitted && timeMs - this.since >= this.holdMs) {
      this.emitted = true;
      return gesture;
    }
    return null;
  }

  reset() {
    this.current = null;
    this.emitted = false;
  }
}
