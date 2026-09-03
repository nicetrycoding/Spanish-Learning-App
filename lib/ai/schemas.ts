import { z } from "zod";

export const mistakeExplanationSchema = z.object({
  whatWasWrong: z.string(),
  why: z.string(),
  correctForm: z.string(),
  naturalAlternatives: z.array(z.string()).default([]),
  similarExamples: z.array(z.object({ es: z.string(), en: z.string() })).default([]),
});
export type MistakeExplanation = z.infer<typeof mistakeExplanationSchema>;

export const writingEvaluationSchema = z.object({
  grammar: z.number().min(0).max(100),
  vocabulary: z.number().min(0).max(100),
  coherence: z.number().min(0).max(100),
  naturalness: z.number().min(0).max(100),
  cefr: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
  corrections: z
    .array(z.object({ original: z.string(), corrected: z.string(), explanation: z.string() }))
    .default([]),
  improvedVersion: z.string(),
  suggestedVocabulary: z.array(z.string()).default([]),
  overallFeedback: z.string(),
});
export type WritingEvaluation = z.infer<typeof writingEvaluationSchema>;

export const speakingEvaluationSchema = z.object({
  pronunciation: z.number().min(0).max(100),
  fluency: z.number().min(0).max(100),
  grammar: z.number().min(0).max(100),
  vocabulary: z.number().min(0).max(100),
  comprehensibility: z.number().min(0).max(100),
  pace: z.number().min(0).max(100),
  feedback: z.string(),
});
export type SpeakingEvaluation = z.infer<typeof speakingEvaluationSchema>;

export const conversationReplySchema = z.object({
  reply: z.string(),
  corrections: z
    .array(z.object({ original: z.string(), corrected: z.string(), explanation: z.string() }))
    .optional(),
});
export type ConversationReply = z.infer<typeof conversationReplySchema>;

export const contentExtractionSchema = z.object({
  cefrEstimate: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
  vocabulary: z.array(z.object({ es: z.string(), en: z.string() })).max(15),
  expressions: z.array(z.object({ es: z.string(), en: z.string() })).max(10),
  grammarTopics: z.array(z.string()).max(6),
  culturalNotes: z.array(z.string()).max(5).default([]),
  summaryEn: z.string(),
});
export type ContentExtraction = z.infer<typeof contentExtractionSchema>;

const generatedLessonExerciseSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "FILL_BLANK", "TRANSLATION"]),
  prompt: z.string(),
  question: z.string().optional(),
  sentence: z.string().optional(),
  source: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctIndex: z.number().optional(),
  acceptableAnswers: z.array(z.string()).optional(),
  direction: z.enum(["es-en", "en-es"]).optional(),
  explanation: z.string(),
});

export const generatedLessonContentSchema = z.object({
  title: z.string(),
  vocabulary: z.array(z.object({ es: z.string(), en: z.string(), example: z.string() })).max(12),
  grammarNote: z.string(),
  dialogue: z.array(z.object({ speaker: z.string(), es: z.string(), en: z.string() })).max(12),
  listeningTask: z.object({ transcriptEs: z.string(), question: z.string(), answer: z.string() }),
  exercises: z.array(generatedLessonExerciseSchema).max(8),
  speakingTask: z.string(),
  writingTask: z.string(),
});
export type GeneratedLessonContent = z.infer<typeof generatedLessonContentSchema>;

export const learnerAnalysisSchema = z.object({
  summary: z.string(),
  focusRecommendation: z.string(),
});
export type LearnerAnalysis = z.infer<typeof learnerAnalysisSchema>;
