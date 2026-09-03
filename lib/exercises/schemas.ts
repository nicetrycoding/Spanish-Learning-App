import { z } from "zod";

/**
 * Every exercise "data" JSON blob — whether hand-authored in the seed data
 * or produced by the AI lesson generator — is validated against one of
 * these schemas before it is ever persisted or rendered. This is the single
 * source of truth for exercise shape across the lesson engine, the exercise
 * runner UI, and AI generation. Nothing reaches the client unvalidated.
 */

const nonEmpty = z.string().trim().min(1);

export const multipleChoiceDataSchema = z.object({
  question: nonEmpty,
  options: z.array(nonEmpty).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const flashcardDataSchema = z.object({
  front: nonEmpty,
  back: nonEmpty,
  hint: z.string().optional(),
});

export const matchingDataSchema = z.object({
  pairs: z.array(z.object({ left: nonEmpty, right: nonEmpty })).min(3).max(8),
});

export const translationDataSchema = z.object({
  direction: z.enum(["es-en", "en-es"]),
  source: nonEmpty,
  acceptableAnswers: z.array(nonEmpty).min(1),
});

export const fillBlankDataSchema = z.object({
  sentence: nonEmpty, // contains "___" placeholder
  acceptableAnswers: z.array(nonEmpty).min(1),
  wordBank: z.array(nonEmpty).optional(),
});

export const contextualSelectDataSchema = z.object({
  context: nonEmpty,
  question: nonEmpty,
  options: z.array(nonEmpty).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const sentenceTransformDataSchema = z.object({
  instruction: nonEmpty,
  source: nonEmpty,
  acceptableAnswers: z.array(nonEmpty).min(1),
});

export const errorCorrectionDataSchema = z.object({
  sentenceWithError: nonEmpty,
  acceptableAnswers: z.array(nonEmpty).min(1),
  errorSpan: z.string().optional(),
});

export const tenseSelectDataSchema = z.object({
  sentence: nonEmpty, // contains "___" placeholder
  infinitive: nonEmpty,
  options: z.array(nonEmpty).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const sentenceOrderDataSchema = z.object({
  words: z.array(nonEmpty).min(3).max(12),
  correctOrder: z.array(z.number().int().min(0)).min(3),
});

const comprehensionQuestionSchema = z.object({
  id: z.string(),
  question: nonEmpty,
  options: z.array(nonEmpty).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const readingComprehensionDataSchema = z.object({
  passageEs: nonEmpty,
  passageEn: z.string().optional(),
  questions: z.array(comprehensionQuestionSchema).min(1).max(8),
});

export const listeningComprehensionDataSchema = z.object({
  transcriptEs: nonEmpty,
  transcriptEn: z.string().optional(),
  audioUrl: z.string().optional(),
  questions: z.array(comprehensionQuestionSchema).min(1).max(8),
});

export const dictationDataSchema = z.object({
  audioText: nonEmpty,
  acceptableAnswers: z.array(nonEmpty).min(1),
});

export const missingWordDataSchema = z.object({
  sentence: nonEmpty,
  options: z.array(nonEmpty).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const writingPromptDataSchema = z.object({
  promptEs: nonEmpty,
  promptEn: z.string().optional(),
  minWords: z.number().int().min(1).default(20),
});

export const speakingPromptDataSchema = z.object({
  promptEs: nonEmpty,
  promptEn: z.string().optional(),
  targetPhrase: z.string().optional(),
});

export const exerciseDataByType = {
  MULTIPLE_CHOICE: multipleChoiceDataSchema,
  FLASHCARD: flashcardDataSchema,
  MATCHING: matchingDataSchema,
  TRANSLATION: translationDataSchema,
  FILL_BLANK: fillBlankDataSchema,
  CONTEXTUAL_SELECT: contextualSelectDataSchema,
  SENTENCE_TRANSFORM: sentenceTransformDataSchema,
  ERROR_CORRECTION: errorCorrectionDataSchema,
  TENSE_SELECT: tenseSelectDataSchema,
  SENTENCE_ORDER: sentenceOrderDataSchema,
  READING_COMPREHENSION: readingComprehensionDataSchema,
  LISTENING_COMPREHENSION: listeningComprehensionDataSchema,
  DICTATION: dictationDataSchema,
  MISSING_WORD: missingWordDataSchema,
  WRITING_PROMPT: writingPromptDataSchema,
  SPEAKING_PROMPT: speakingPromptDataSchema,
} as const;

export type ExerciseTypeKey = keyof typeof exerciseDataByType;

export function validateExerciseData(type: ExerciseTypeKey, data: unknown) {
  const schema = exerciseDataByType[type];
  return schema.safeParse(data);
}

/** Full exercise record shape used when authoring/validating seed or AI content. */
export const exerciseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("MULTIPLE_CHOICE"), data: multipleChoiceDataSchema }),
  z.object({ type: z.literal("FLASHCARD"), data: flashcardDataSchema }),
  z.object({ type: z.literal("MATCHING"), data: matchingDataSchema }),
  z.object({ type: z.literal("TRANSLATION"), data: translationDataSchema }),
  z.object({ type: z.literal("FILL_BLANK"), data: fillBlankDataSchema }),
  z.object({ type: z.literal("CONTEXTUAL_SELECT"), data: contextualSelectDataSchema }),
  z.object({ type: z.literal("SENTENCE_TRANSFORM"), data: sentenceTransformDataSchema }),
  z.object({ type: z.literal("ERROR_CORRECTION"), data: errorCorrectionDataSchema }),
  z.object({ type: z.literal("TENSE_SELECT"), data: tenseSelectDataSchema }),
  z.object({ type: z.literal("SENTENCE_ORDER"), data: sentenceOrderDataSchema }),
  z.object({ type: z.literal("READING_COMPREHENSION"), data: readingComprehensionDataSchema }),
  z.object({ type: z.literal("LISTENING_COMPREHENSION"), data: listeningComprehensionDataSchema }),
  z.object({ type: z.literal("DICTATION"), data: dictationDataSchema }),
  z.object({ type: z.literal("MISSING_WORD"), data: missingWordDataSchema }),
  z.object({ type: z.literal("WRITING_PROMPT"), data: writingPromptDataSchema }),
  z.object({ type: z.literal("SPEAKING_PROMPT"), data: speakingPromptDataSchema }),
]);

const baseExerciseFields = z.object({
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  cefrLevel: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
  skillTag: z.enum(["GRAMMAR", "VOCABULARY", "READING", "LISTENING", "WRITING", "SPEAKING"]),
  difficulty: z.number().int().min(1).max(10),
});

/** Used to validate a fully-formed AI-generated exercise before it is saved. */
export const generatedExerciseSchema = z.intersection(baseExerciseFields, exerciseSchema);
export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>;
