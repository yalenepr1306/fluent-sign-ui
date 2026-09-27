export const speechLangs: Record<string, string> = {
  english: "en-US",
  hindi: "hi-IN",
  tamil: "ta-IN",
  spanish: "es-ES",
};

export const languageNames: Record<string, string> = {
  english: "English",
  hindi: "Hindi",
  tamil: "Tamil",
  spanish: "Spanish",
};

export const speechRates: Record<string, number> = { slow: 0.75, normal: 1, fast: 1.5 };
export const speechPitches: Record<string, number> = { low: 0.7, normal: 1, high: 1.4 };

const normalise = (tag: string) => tag.replace("_", "-").toLowerCase();

// Prefers an exact locale match (hi-IN), then any voice for the language (hi-*),
// and within each group a local voice, which works offline and starts faster.
export const pickVoice = (voices: SpeechSynthesisVoice[], langTag: string) => {
  const wanted = normalise(langTag);
  const base = wanted.split("-")[0];
  const exact = voices.filter((v) => normalise(v.lang) === wanted);
  const sameLanguage = voices.filter((v) => normalise(v.lang).split("-")[0] === base);
  const best = (list: SpeechSynthesisVoice[]) => list.find((v) => v.localService) ?? list[0];
  return best(exact) ?? best(sameLanguage) ?? null;
};

// Chrome stops long utterances after about 15 seconds, so speak one sentence at a time.
export const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
