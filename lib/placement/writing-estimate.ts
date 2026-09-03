import { fromContinuous, type CEFRLevelKey } from "@/lib/cefr";

/**
 * Deterministic heuristic CEFR estimate for the placement test's free-
 * production writing prompt. This is intentionally rule-based rather than
 * an AI call: the placement test must return an instant result even
 * without an AI provider configured (see AIService's fallback philosophy).
 * `services/writing-service.ts` refines writing mastery further using
 * AIService once the learner submits real Writing Lab tasks.
 */
export interface WritingEstimate {
  level: CEFRLevelKey;
  sub: number;
  feedback: string;
}

const B1_CONNECTORS = ["porque", "aunque", "sin embargo", "por lo tanto", "además", "mientras", "cuando"];
const B2_CONNECTORS = ["no obstante", "por consiguiente", "en cambio", "de hecho", "a pesar de"];
const SUBJUNCTIVE_HINTS = ["que sea", "que tenga", "que pueda", "espero que", "ojalá", "aunque sea"];

export function estimateWritingLevel(text: string): WritingEstimate {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { level: "A0", sub: 0, feedback: "No response given — starting from the very beginning is completely fine." };
  }

  const words = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;
  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;
  const sentenceCount = Math.max(1, (trimmed.match(/[.!?]+/g) ?? []).length);
  const avgSentenceLength = wordCount / sentenceCount;

  const lower = trimmed.toLowerCase();
  const hasB1Connector = B1_CONNECTORS.some((c) => lower.includes(c));
  const hasB2Connector = B2_CONNECTORS.some((c) => lower.includes(c));
  const hasSubjunctive = SUBJUNCTIVE_HINTS.some((c) => lower.includes(c));

  // Base score from raw output volume — a beginner physically cannot
  // produce much; a fluent writer produces more, with more varied words.
  let continuous = 0;
  if (wordCount >= 3) continuous = 0.3;
  if (wordCount >= 10) continuous = 1.0;
  if (wordCount >= 20) continuous = 1.8;
  if (wordCount >= 30) continuous = 2.4;
  if (wordCount >= 40) continuous = 3.0;

  if (avgSentenceLength > 9) continuous += 0.4;
  if (lexicalDiversity > 0.7 && wordCount > 15) continuous += 0.4;
  if (hasB1Connector) continuous += 0.6;
  if (hasB2Connector) continuous += 1.0;
  if (hasSubjunctive) continuous += 1.2;

  const { level, sub } = fromContinuous(continuous);

  const feedback =
    wordCount < 5
      ? "A very short response — that's expected at the start. Writing practice will build this up quickly."
      : hasSubjunctive || hasB2Connector
        ? "Your writing already uses connectors and structures well beyond basic sentences."
        : hasB1Connector
          ? "You're linking ideas with connectors like 'porque' or 'aunque' — a solid intermediate signal."
          : "You're forming complete, understandable sentences — a good elementary foundation.";

  return { level, sub, feedback };
}
