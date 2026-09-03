import "server-only";
import { generateText, extractJson, isAiConfigured } from "./provider";
import {
  mistakeExplanationSchema,
  writingEvaluationSchema,
  speakingEvaluationSchema,
  conversationReplySchema,
  contentExtractionSchema,
  generatedLessonContentSchema,
  learnerAnalysisSchema,
  type MistakeExplanation,
  type WritingEvaluation,
  type SpeakingEvaluation,
  type ConversationReply,
  type ContentExtraction,
  type GeneratedLessonContent,
} from "./schemas";
import { generatedExerciseSchema, type GeneratedExercise } from "@/lib/exercises/schemas";
import { estimateWritingLevel } from "@/lib/placement/writing-estimate";
import type { CEFRLevelKey } from "@/lib/cefr";

export interface LearnerContext {
  level: CEFRLevelKey;
  region?: string;
  goals?: string[];
}

function levelInstruction(level: CEFRLevelKey): string {
  if (level === "A0" || level === "A1") return "Use extremely simple English explanations and only the most basic Spanish vocabulary. Avoid grammar jargon.";
  if (level === "A2") return "Use simple English explanations, basic grammar terms are OK (verb, noun, past tense).";
  if (level === "B1" || level === "B2") return "You can use standard grammar terminology and explain nuance, but keep explanations concise.";
  return "The learner is advanced — you can discuss register, nuance, and idiom directly, in Spanish if appropriate, without over-explaining basics.";
}

/**
 * ============================================================================
 * AIService — the single abstraction every AI-touched feature goes through.
 * ============================================================================
 * Every method tries the configured provider first (server-only, see
 * lib/ai/provider.ts) and validates its output against a Zod schema. If no
 * provider is configured, the call failed, or the output doesn't validate,
 * we fall back to a deterministic rule-based result — the app is fully
 * functional with zero AI spend, and AI only ever *enhances* it.
 * Nothing from an AI response reaches the database or the UI unvalidated.
 * ============================================================================
 */
export const AIService = {
  isConfigured: isAiConfigured,

  async explainMistake(input: {
    userInput: string;
    correctForm: string;
    category: string;
    baseExplanation?: string | null;
    learner: LearnerContext;
  }): Promise<MistakeExplanation> {
    const text = await generateText({
      system: `You are a Spanish teacher explaining a student's mistake. ${levelInstruction(input.learner.level)} Respond ONLY with JSON matching: {"whatWasWrong": string, "why": string, "correctForm": string, "naturalAlternatives": string[], "similarExamples": {"es": string, "en": string}[]}. Never agree with an incorrect form.`,
      prompt: `The student is at CEFR level ${input.learner.level}. They wrote: "${input.userInput}". The correct form is: "${input.correctForm}". Category: ${input.category}. ${input.baseExplanation ? `Context: ${input.baseExplanation}` : ""}`,
      maxTokens: 600,
    });

    if (text) {
      const parsed = mistakeExplanationSchema.safeParse(extractJson(text));
      if (parsed.success) return parsed.data;
    }

    return {
      whatWasWrong: `"${input.userInput}" isn't the standard form here.`,
      why: input.baseExplanation ?? `This is a common ${input.category.toLowerCase().replace(/_/g, " ")} pattern worth reviewing.`,
      correctForm: input.correctForm,
      naturalAlternatives: [],
      similarExamples: [],
    };
  },

  async evaluateWriting(input: {
    text: string;
    prompt: string;
    learner: LearnerContext;
  }): Promise<WritingEvaluation> {
    const aiText = await generateText({
      system: `You are evaluating a Spanish learner's writing (CEFR ${input.learner.level}). ${levelInstruction(input.learner.level)} Respond ONLY with JSON: {"grammar":0-100,"vocabulary":0-100,"coherence":0-100,"naturalness":0-100,"cefr":"A0|A1|A2|B1|B2|C1|C2","corrections":[{"original":string,"corrected":string,"explanation":string}],"improvedVersion":string,"suggestedVocabulary":string[],"overallFeedback":string}. Be honest, not just encouraging — this drives their skill profile.`,
      prompt: `Writing prompt: "${input.prompt}"\n\nStudent's response:\n"${input.text}"`,
      maxTokens: 1200,
    });

    if (aiText) {
      const parsed = writingEvaluationSchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }

    const heuristic = estimateWritingLevel(input.text);
    const wordCount = input.text.trim().split(/\s+/).filter(Boolean).length;
    const base = Math.min(90, 40 + wordCount * 1.5);
    return {
      grammar: Math.round(base * 0.9),
      vocabulary: Math.round(base * 0.95),
      coherence: Math.round(base),
      naturalness: Math.round(base * 0.85),
      cefr: heuristic.level,
      corrections: [],
      improvedVersion: input.text,
      suggestedVocabulary: [],
      overallFeedback: `${heuristic.feedback} (Automated estimate — connect an AI provider for detailed corrections.)`,
    };
  },

  async evaluateSpeaking(input: {
    transcript: string;
    prompt: string;
    learner: LearnerContext;
  }): Promise<SpeakingEvaluation> {
    const aiText = await generateText({
      system: `You are evaluating a Spanish learner's spoken response, given only its transcript (no audio access). ${levelInstruction(input.learner.level)} Respond ONLY with JSON: {"pronunciation":0-100,"fluency":0-100,"grammar":0-100,"vocabulary":0-100,"comprehensibility":0-100,"pace":0-100,"feedback":string}. Since you cannot hear the audio, estimate pronunciation/pace conservatively (around 60-75) unless the transcript suggests otherwise, and say so in the feedback.`,
      prompt: `Speaking prompt: "${input.prompt}"\n\nTranscript of what the student said:\n"${input.transcript}"`,
      maxTokens: 600,
    });

    if (aiText) {
      const parsed = speakingEvaluationSchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }

    const wordCount = input.transcript.trim().split(/\s+/).filter(Boolean).length;
    const base = Math.min(85, 45 + wordCount * 2);
    return {
      pronunciation: 65,
      fluency: Math.round(base * 0.9),
      grammar: Math.round(base * 0.85),
      vocabulary: Math.round(base * 0.9),
      comprehensibility: Math.round(base),
      pace: 65,
      feedback:
        wordCount === 0
          ? "No speech was captured — try again in a quiet environment."
          : "Estimated from your transcript only (pronunciation/pace need an AI provider for accurate scoring).",
    };
  },

  async generateConversationReply(input: {
    history: { role: "user" | "assistant"; content: string }[];
    characterSystemPrompt: string;
    learner: LearnerContext;
    immersionLevel: string;
    correctionMode: "after" | "immediate";
  }): Promise<ConversationReply> {
    const aiText = await generateText({
      system: `${input.characterSystemPrompt}\n\nThe learner is at CEFR ${input.learner.level}. ${levelInstruction(input.learner.level)} Stay in character and respond naturally in Spanish (adapt complexity to their level) — do not interrupt with corrections unless correction mode is "immediate". ${input.correctionMode === "immediate" ? "Since correction mode is immediate, gently note any clear error in a short aside, then continue the conversation." : "Do not correct errors inline — just respond naturally; corrections are given separately at the end."} Respond ONLY with JSON: {"reply": string, "corrections": [{"original":string,"corrected":string,"explanation":string}] (optional, only if correction mode is immediate and there was an error)}.`,
      prompt: input.history.map((m) => `${m.role === "user" ? "Student" : "You"}: ${m.content}`).join("\n"),
      maxTokens: 500,
    });

    if (aiText) {
      const parsed = conversationReplySchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }

    return { reply: scriptedFallbackReply(input.history) };
  },

  async generateExercise(input: {
    topic: string;
    cefrLevel: CEFRLevelKey;
    skillTag: string;
    seedVocabulary?: string[];
  }): Promise<GeneratedExercise | null> {
    const aiText = await generateText({
      system: `Generate one Spanish-learning exercise as JSON. It MUST match this exact shape based on "type":\n{"type":"MULTIPLE_CHOICE","prompt":string,"explanation":string,"cefrLevel":"${input.cefrLevel}","skillTag":"${input.skillTag}","difficulty":1-10,"data":{"question":string,"options":string[2-6],"correctIndex":number}}\nReturn ONLY that JSON object, nothing else.`,
      prompt: `Topic: ${input.topic}. CEFR level: ${input.cefrLevel}.${input.seedVocabulary ? ` Try to use some of these words: ${input.seedVocabulary.join(", ")}.` : ""}`,
      maxTokens: 500,
    });
    if (!aiText) return null;
    const parsed = generatedExerciseSchema.safeParse(extractJson(aiText));
    return parsed.success ? parsed.data : null;
  },

  async generateLesson(input: {
    topic: string;
    learner: LearnerContext;
    fallbackVocabulary: { es: string; en: string; example: string }[];
  }): Promise<GeneratedLessonContent> {
    const aiText = await generateText({
      system: `Create a mini Spanish lesson as JSON for a CEFR ${input.learner.level} learner. ${levelInstruction(input.learner.level)} Respond ONLY with JSON matching: {"title":string,"vocabulary":[{"es":string,"en":string,"example":string}] (8-12 items),"grammarNote":string,"dialogue":[{"speaker":string,"es":string,"en":string}] (6-10 lines),"listeningTask":{"transcriptEs":string,"question":string,"answer":string},"exercises":[{"type":"MULTIPLE_CHOICE"|"FILL_BLANK"|"TRANSLATION","prompt":string,"question":string,"options":string[],"correctIndex":number,"explanation":string}] (4-6 items),"speakingTask":string,"writingTask":string}. Use natural, real Spanish relevant to: "${input.topic}".`,
      prompt: `Generate the lesson now.`,
      maxTokens: 2000,
    });

    if (aiText) {
      const parsed = generatedLessonContentSchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }

    return buildFallbackLesson(input.topic, input.fallbackVocabulary);
  },

  async extractContent(input: { rawText: string; learner: LearnerContext }): Promise<ContentExtraction> {
    const aiText = await generateText({
      system: `Analyze this Spanish-language text/transcript for a language learner. Respond ONLY with JSON: {"cefrEstimate":"A0|A1|A2|B1|B2|C1|C2","vocabulary":[{"es":string,"en":string}] (up to 15 useful words),"expressions":[{"es":string,"en":string}] (up to 10 chunks/collocations),"grammarTopics":string[] (up to 6 grammar points visible in the text),"culturalNotes":string[] (up to 5),"summaryEn":string (one paragraph)}.`,
      prompt: input.rawText.slice(0, 6000),
      maxTokens: 1500,
    });
    if (aiText) {
      const parsed = contentExtractionSchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }
    return {
      cefrEstimate: input.learner.level,
      vocabulary: [],
      expressions: [],
      grammarTopics: [],
      culturalNotes: [],
      summaryEn: "Automated extraction requires an AI provider to be configured. Showing the raw text only.",
    };
  },

  async analyzeLearner(input: { weakAreas: { label: string; reason: string }[]; level: CEFRLevelKey }) {
    const aiText = await generateText({
      system: `You are a Spanish learning coach. Respond ONLY with JSON: {"summary": string (1-2 sentences), "focusRecommendation": string (1 sentence, actionable)}.`,
      prompt: `Learner is at CEFR ${input.level}. Their current weak areas: ${input.weakAreas.map((w) => `${w.label} (${w.reason})`).join("; ") || "none identified yet"}.`,
      maxTokens: 300,
    });
    if (aiText) {
      const parsed = learnerAnalysisSchema.safeParse(extractJson(aiText));
      if (parsed.success) return parsed.data;
    }
    const top = input.weakAreas[0];
    return {
      summary: top
        ? `Your data points to ${top.label.toLowerCase()} as the area with the most room to grow right now.`
        : "You don't have enough activity yet for a detailed analysis — keep practicing.",
      focusRecommendation: top ? `Spend today's session on ${top.label.toLowerCase()}.` : "Complete a few more lessons to unlock personalized analysis.",
    };
  },
};

function scriptedFallbackReply(history: { role: "user" | "assistant"; content: string }[]): string {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  if (/gracias/.test(lastUser)) return "¡De nada! ¿Hay algo más en lo que te pueda ayudar?";
  if (/hola|buenas/.test(lastUser)) return "¡Hola! ¿Qué tal? Cuéntame, ¿en qué puedo ayudarte hoy?";
  if (/adiós|chau|hasta luego/.test(lastUser)) return "¡Hasta luego! Fue un gusto hablar contigo.";
  if (history.length <= 1) return "¡Encantado de hablar contigo! Cuéntame un poco más.";
  return "Entiendo. ¿Puedes contarme un poco más sobre eso?";
}

function buildFallbackLesson(
  topic: string,
  vocabulary: { es: string; en: string; example: string }[],
): GeneratedLessonContent {
  const vocab = vocabulary.slice(0, 10);
  return {
    title: `Spanish for: ${topic}`,
    vocabulary: vocab,
    grammarNote: `This mini-lesson focuses on vocabulary for "${topic}". Connect an AI provider for a tailored grammar note.`,
    dialogue:
      vocab.length >= 2
        ? [
            { speaker: "A", es: `¿Sabes algo sobre ${topic}?`, en: `Do you know anything about ${topic}?` },
            { speaker: "B", es: `Un poco. Por ejemplo, "${vocab[0].es}".`, en: `A little. For example, "${vocab[0].en}".` },
          ]
        : [],
    listeningTask: {
      transcriptEs: vocab[0] ? vocab[0].example : `Hoy vamos a hablar sobre ${topic}.`,
      question: "¿De qué se trata?",
      answer: `De ${topic}.`,
    },
    exercises: vocab.slice(0, 4).map((v) => ({
      type: "MULTIPLE_CHOICE" as const,
      prompt: `¿Qué significa "${v.es}"?`,
      question: `¿Qué significa "${v.es}"?`,
      options: [v.en, "algo diferente", "no estoy seguro", "ninguna de las anteriores"],
      correctIndex: 0,
      explanation: `"${v.es}" significa "${v.en}".`,
    })),
    speakingTask: `Practica diciendo en voz alta 3 frases sobre ${topic} usando el vocabulario nuevo.`,
    writingTask: `Escribe 3-4 frases sobre ${topic} usando al menos dos palabras nuevas.`,
  };
}
