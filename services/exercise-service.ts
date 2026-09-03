import "server-only";
import type { ConfidenceLevel, ExerciseType, MistakeCategory, SkillType } from "@prisma/client";
import { db } from "@/lib/db";
import { gradeExercise, type GradeResult } from "@/lib/exercises/grading";
import type { ExerciseTypeKey } from "@/lib/exercises/schemas";
import { updateAbilityContinuous, ONGOING_LEARNING_RATE } from "@/lib/adaptive/ability";
import { CEFR_LEVELS, fromContinuous, toContinuous, type CEFRLevelKey } from "@/lib/cefr";
import { updateStreakAndXp } from "@/services/progress-service";

export interface SubmitExerciseInput {
  userId: string;
  exerciseId: string;
  userAnswer: unknown;
  confidence?: ConfidenceLevel;
  timeSpentMs?: number;
  sessionId?: string;
}

export interface SubmitExerciseResult extends GradeResult {
  xpEarned: number;
  correctAnswer?: unknown;
}

const SKILL_TO_PROFILE_FIELD: Record<SkillType, { level: string; sub: string }> = {
  GRAMMAR: { level: "grammarLevel", sub: "grammarSub" },
  VOCABULARY: { level: "vocabularyLevel", sub: "vocabularySub" },
  READING: { level: "readingLevel", sub: "readingSub" },
  LISTENING: { level: "listeningLevel", sub: "listeningSub" },
  WRITING: { level: "writingLevel", sub: "writingSub" },
  SPEAKING: { level: "speakingLevel", sub: "speakingSub" },
};

/** Heuristic mapping from an exercise's skill/type to a mistake category — see Prisma MistakeCategory enum. */
function inferMistakeCategory(skillTag: SkillType, type: ExerciseType): MistakeCategory {
  if (type === "TENSE_SELECT") return "CONJUGATION";
  if (type === "SENTENCE_ORDER") return "WORD_ORDER";
  if (skillTag === "VOCABULARY") return "VOCABULARY";
  if (skillTag === "LISTENING") return "LISTENING";
  if (skillTag === "WRITING") return "WRITING";
  if (skillTag === "SPEAKING") return "PRONUNCIATION";
  return "GRAMMAR";
}

export async function submitExerciseAttempt(input: SubmitExerciseInput): Promise<SubmitExerciseResult> {
  const exercise = await db.exercise.findUniqueOrThrow({ where: { id: input.exerciseId } });

  const result = gradeExercise(exercise.type as ExerciseTypeKey, exercise.data, input.userAnswer);

  await db.exerciseAttempt.create({
    data: {
      userId: input.userId,
      exerciseId: exercise.id,
      userAnswer: input.userAnswer as object,
      isCorrect: result.isCorrect,
      confidence: input.confidence,
      timeSpentMs: input.timeSpentMs,
      sessionId: input.sessionId,
    },
  });

  const xpEarned = result.isCorrect ? 10 + Math.round(exercise.difficulty / 2) : 2;

  await Promise.all([
    updateStreakAndXp(input.userId, xpEarned, { exercisesCompleted: 1 }),
    nudgeSkillProfile(input.userId, exercise.skillTag, exercise.cefrLevel, exercise.difficulty, result.isCorrect),
    !result.isCorrect
      ? recordMistakeFromExercise(input.userId, exercise, input.userAnswer, result)
      : Promise.resolve(),
  ]);

  return { ...result, xpEarned };
}

async function nudgeSkillProfile(
  userId: string,
  skillTag: SkillType,
  cefrLevel: CEFRLevelKey,
  difficulty: number,
  isCorrect: boolean,
) {
  const profile = await db.skillProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const field = SKILL_TO_PROFILE_FIELD[skillTag];
  const currentLevel = profile[field.level as keyof typeof profile] as CEFRLevelKey;
  const currentSub = profile[field.sub as keyof typeof profile] as number;

  const itemDifficulty = CEFR_LEVELS.indexOf(cefrLevel) + difficulty / 10;
  const currentAbility = toContinuous(currentLevel, currentSub);
  const nextAbility = updateAbilityContinuous(currentAbility, itemDifficulty, isCorrect, ONGOING_LEARNING_RATE);
  const { level: nextLevel, sub: nextSub } = fromContinuous(nextAbility);

  // Overall level/sub is the mean of the six skills — recompute after the nudge.
  const updated = { ...profile, [field.level]: nextLevel, [field.sub]: nextSub };
  const skills: SkillType[] = ["GRAMMAR", "VOCABULARY", "READING", "LISTENING", "WRITING", "SPEAKING"];
  const meanContinuous =
    skills.reduce((sum, s) => {
      const f = SKILL_TO_PROFILE_FIELD[s];
      return sum + toContinuous(updated[f.level as keyof typeof updated] as CEFRLevelKey, updated[f.sub as keyof typeof updated] as number);
    }, 0) / skills.length;
  const overall = fromContinuous(meanContinuous);

  await db.skillProfile.update({
    where: { userId },
    data: {
      [field.level]: nextLevel,
      [field.sub]: nextSub,
      overallLevel: overall.level,
      overallSub: overall.sub,
    },
  });
}

async function recordMistakeFromExercise(
  userId: string,
  exercise: { id: string; skillTag: SkillType; type: ExerciseType; cefrLevel: CEFRLevelKey; explanation: string },
  userAnswer: unknown,
  result: GradeResult,
) {
  const category = inferMistakeCategory(exercise.skillTag, exercise.type);
  const userInput = summarizeAnswer(userAnswer);
  const correctForm = summarizeAnswer(result.correctAnswer);

  const existing = await db.mistake.findFirst({
    where: { userId, sourceType: "EXERCISE", sourceId: exercise.id, resolved: false },
  });

  let mistakeId: string;
  if (existing) {
    const updated = await db.mistake.update({
      where: { id: existing.id },
      data: { occurrenceCount: { increment: 1 }, lastOccurredAt: new Date() },
    });
    mistakeId = updated.id;
  } else {
    const created = await db.mistake.create({
      data: {
        userId,
        category,
        sourceType: "EXERCISE",
        sourceId: exercise.id,
        userInput,
        correctForm,
        explanation: exercise.explanation,
        cefrLevel: exercise.cefrLevel,
      },
    });
    mistakeId = created.id;
  }

  await db.reviewItem.upsert({
    where: { userId_itemType_refId: { userId, itemType: "MISTAKE", refId: mistakeId } },
    create: {
      userId,
      itemType: "MISTAKE",
      refId: mistakeId,
      mistakeId,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 12), // review again in 12h
      errorFrequency: 1,
      importance: 0.7,
    },
    update: {
      errorFrequency: { increment: 1 },
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 6), // recurring mistake -> resurface sooner
    },
  });
}

function summarizeAnswer(answer: unknown): string {
  if (answer === undefined || answer === null) return "";
  if (typeof answer === "string") return answer;
  if (typeof answer === "object") {
    const obj = answer as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.selectedIndex === "number") return `option ${obj.selectedIndex}`;
    return JSON.stringify(answer);
  }
  return String(answer);
}
