"use client";

/**
 * Thin wrapper over the Web Speech Synthesis API, used by the placement
 * test's listening items, the Listening Laboratory, and shadowing practice.
 * Runs entirely client-side (no audio files / TTS API costs).
 */
export interface SpeakOptions {
  rate?: number; // 0.5 = slow, 1 = normal
  lang?: string; // BCP-47, e.g. "es-MX", "es-ES", "es-AR"
  onEnd?: () => void;
}

export function speakSpanish(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? "es-419";
  utterance.rate = options.rate ?? 1;
  if (options.onEnd) utterance.onend = options.onEnd;

  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang?.toLowerCase().startsWith(utterance.lang.slice(0, 2)));
  if (match) utterance.voice = match;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function regionToSpeechLang(region?: string): string {
  switch (region) {
    case "SPAIN":
      return "es-ES";
    case "MEXICO":
      return "es-MX";
    case "ARGENTINA":
      return "es-AR";
    case "COLOMBIA":
      return "es-CO";
    default:
      return "es-419";
  }
}
