import { describe, expect, it } from "vitest";
import { pickVoice, splitSentences } from "./speech";

const voice = (lang: string, name: string, localService = false) =>
  ({ lang, name, localService }) as SpeechSynthesisVoice;

describe("pickVoice", () => {
  const voices = [
    voice("en-GB", "UK English"),
    voice("en-US", "US English online"),
    voice("en-US", "US English local", true),
    voice("hi-IN", "Hindi"),
    voice("es_MX", "Spanish Mexico"),
  ];

  it("prefers an exact locale match, local voices first", () => {
    expect(pickVoice(voices, "en-US")?.name).toBe("US English local");
  });

  it("falls back to another voice for the same language", () => {
    expect(pickVoice(voices, "es-ES")?.name).toBe("Spanish Mexico");
  });

  it("returns null when the language has no voice", () => {
    expect(pickVoice(voices, "ta-IN")).toBeNull();
  });
});

describe("splitSentences", () => {
  it("splits on sentence punctuation, including the Hindi danda", () => {
    expect(splitSentences("Hello! How are you? Yes.")).toEqual(["Hello!", "How are you?", "Yes."]);
    expect(splitSentences("हाँ। नहीं।")).toEqual(["हाँ।", "नहीं।"]);
  });
});
