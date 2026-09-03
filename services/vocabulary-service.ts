import "server-only";
import { db } from "@/lib/db";
import type { VocabStatus } from "@prisma/client";
import { scheduleNext, qualityFromOutcome, type Quality } from "@/lib/srs/sm2";
import { computeMastery, updateMasteryComponents, type MasteryComponents } from "@/lib/adaptive/mastery";
import { updateStreakAndXp } from "@/services/progress-service";

export async function getUserVocabulary(userId: string, status?: VocabStatus) {
  return db.userVocabulary.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: { vocabulary: true },
    orderBy: [{ mastery: "asc" }, { createdAt: "desc" }],
  });
}

export async function searchVocabulary(query: string, cefr?: string, tag?: string) {
  return db.vocabulary.findMany({
    where: {
      ...(cefr ? { cefrLevel: cefr as never } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(query
        ? {
            OR: [
              { spanish: { contains: query, mode: "insensitive" } },
              { translation: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    take: 60,
    orderBy: { spanish: "asc" },
  });
}

export async function saveWordForUser(userId: string, vocabularyId: string) {
  return db.userVocabulary.upsert({
    where: { userId_vocabularyId: { userId, vocabularyId } },
    create: { userId, vocabularyId, savedByUser: true, status: "NEW" },
    update: { savedByUser: true },
  });
}

export async function getWordDetail(userId: string, vocabularyId: string) {
  const [vocabulary, userVocabulary] = await Promise.all([
    db.vocabulary.findUnique({ where: { id: vocabularyId } }),
    db.userVocabulary.findUnique({ where: { userId_vocabularyId: { userId, vocabularyId } } }),
  ]);
  return { vocabulary, userVocabulary };
}

export interface VocabReviewOutcome {
  isCorrect: boolean;
  confidence?: "NOT_SURE" | "SOMEWHAT_SURE" | "VERY_SURE" | null;
  wasProduced: boolean; // true when the learner typed the word (production) vs. self-graded recognition
}

/** Applies a review outcome to a UserVocabulary row: SM-2 scheduling + mastery components. */
export async function recordVocabularyReview(userId: string, userVocabularyId: string, outcome: VocabReviewOutcome) {
  const record = await db.userVocabulary.findUniqueOrThrow({ where: { id: userVocabularyId } });
  if (record.userId !== userId) throw new Error("Forbidden");

  const quality: Quality = qualityFromOutcome(outcome.isCorrect, outcome.confidence);
  const srsResult = scheduleNext(
    { easeFactor: record.easeFactor, intervalDays: record.intervalDays, repetitions: record.repetitions },
    quality,
  );

  const currentComponents: MasteryComponents = {
    exposure: record.exposure,
    understanding: record.understanding,
    accuracy: record.accuracy,
    retention: record.retention,
    production: record.production,
  };
  const nextComponents = updateMasteryComponents(currentComponents, {
    sawIt: true,
    understood: outcome.isCorrect,
    wasCorrect: outcome.isCorrect,
    wasRecalledAfterDelay: record.repetitions > 0 ? outcome.isCorrect : undefined,
    wasProduced: outcome.wasProduced ? outcome.isCorrect : undefined,
  });
  const mastery = computeMastery(nextComponents);
  const wasAlreadyMastered = record.status === "MASTERED";
  const status: VocabStatus = mastery >= 85 ? "MASTERED" : mastery >= 40 ? "REVIEW" : mastery > 0 ? "LEARNING" : "NEW";

  await db.userVocabulary.update({
    where: { id: userVocabularyId },
    data: {
      ...nextComponents,
      mastery,
      status,
      easeFactor: srsResult.easeFactor,
      intervalDays: srsResult.intervalDays,
      repetitions: srsResult.repetitions,
      nextReviewAt: srsResult.nextReviewAt,
      lastReviewedAt: new Date(),
      timesCorrect: { increment: outcome.isCorrect ? 1 : 0 },
      timesIncorrect: { increment: outcome.isCorrect ? 0 : 1 },
    },
  });

  const xp = outcome.isCorrect ? (outcome.wasProduced ? 6 : 4) : 1;
  const newlyMastered = status === "MASTERED" && !wasAlreadyMastered;
  await updateStreakAndXp(userId, xp, newlyMastered ? { wordsMastered: 1 } : {});

  return { mastery, status, nextReviewAt: srsResult.nextReviewAt };
}
