import "server-only";
import { db } from "@/lib/db";
import { computeReviewPriority, forgettingProbability, scheduleNext, qualityFromOutcome, type Quality } from "@/lib/srs/sm2";
import { toContinuous } from "@/lib/cefr";
import { recordVocabularyReview } from "@/services/vocabulary-service";
import { applyGrammarPracticeOutcome } from "@/services/grammar-service";
import { updateStreakAndXp } from "@/services/progress-service";

export type ReviewKind = "VOCABULARY" | "GRAMMAR" | "MISTAKE";

export interface ReviewCard {
  queueId: string; // `${type}:${refId}` — stable client key
  type: ReviewKind;
  refId: string; // UserVocabulary id / GrammarTopic id / Mistake id
  front: string;
  back: string;
  note?: string;
  mode: "recognition" | "production"; // recognition = flashcard flip; production = type the answer
  dueAt: Date;
  priorityScore: number;
}

/**
 * Assembles the unified review queue described in the product spec: due
 * vocabulary (from UserVocabulary, which carries its own SM-2 state),
 * grammar concepts, and recurring mistakes (both via ReviewItem) — ranked
 * by one shared priority score (forgetting probability + error frequency +
 * difficulty + recency + importance + confidence).
 */
export async function getDueReviewQueue(userId: string, limit = 15): Promise<ReviewCard[]> {
  const now = new Date();

  const [dueVocab, dueReviewItems] = await Promise.all([
    db.userVocabulary.findMany({
      where: { userId, nextReviewAt: { lte: now }, status: { not: "NEW" } },
      include: { vocabulary: true },
      take: 60,
    }),
    db.reviewItem.findMany({
      where: { userId, dueAt: { lte: now } },
      include: { mistake: true },
      take: 60,
    }),
  ]);

  const cards: ReviewCard[] = [];

  for (const uv of dueVocab) {
    const daysSince = uv.lastReviewedAt ? (now.getTime() - uv.lastReviewedAt.getTime()) / 86_400_000 : 3;
    const daysOverdue = (now.getTime() - uv.nextReviewAt.getTime()) / 86_400_000;
    const priority = computeReviewPriority({
      forgettingProbability: forgettingProbability(daysSince, uv.easeFactor, uv.repetitions),
      errorFrequency: uv.timesIncorrect,
      difficulty: uv.vocabulary.difficulty,
      daysOverdue,
      importance: 0.6,
      confidence: uv.mastery / 100,
    });
    const production = Math.random() < 0.5;
    cards.push({
      queueId: `VOCABULARY:${uv.id}`,
      type: "VOCABULARY",
      refId: uv.id,
      front: production ? uv.vocabulary.translation : uv.vocabulary.spanish,
      back: production ? uv.vocabulary.spanish : uv.vocabulary.translation,
      note: uv.vocabulary.exampleEs,
      mode: production ? "production" : "recognition",
      dueAt: uv.nextReviewAt,
      priorityScore: priority,
    });
  }

  const grammarItems = dueReviewItems.filter((r) => r.itemType === "GRAMMAR");
  const mistakeItems = dueReviewItems.filter((r) => r.itemType === "MISTAKE");

  const grammarTopics = await db.grammarTopic.findMany({
    where: { id: { in: grammarItems.map((r) => r.refId) } },
  });
  const grammarById = new Map(grammarTopics.map((g) => [g.id, g]));

  for (const item of grammarItems) {
    const topic = grammarById.get(item.refId);
    if (!topic) continue;
    const daysOverdue = (now.getTime() - item.dueAt.getTime()) / 86_400_000;
    const priority = computeReviewPriority({
      forgettingProbability: item.forgettingProbability,
      errorFrequency: item.errorFrequency,
      difficulty: 5,
      daysOverdue,
      importance: item.importance,
    });
    cards.push({
      queueId: `GRAMMAR:${item.id}`,
      type: "GRAMMAR",
      refId: item.id,
      front: topic.title,
      back: topic.summary,
      note: (topic.examples as { es: string; en: string }[])[0]?.es,
      mode: "recognition",
      dueAt: item.dueAt,
      priorityScore: priority,
    });
  }

  for (const item of mistakeItems) {
    if (!item.mistake) continue;
    const daysOverdue = (now.getTime() - item.dueAt.getTime()) / 86_400_000;
    const priority = computeReviewPriority({
      forgettingProbability: item.forgettingProbability,
      errorFrequency: item.errorFrequency,
      difficulty: 5,
      daysOverdue,
      importance: item.importance,
    });
    cards.push({
      queueId: `MISTAKE:${item.id}`,
      type: "MISTAKE",
      refId: item.id,
      front: item.mistake.userInput,
      back: item.mistake.correctForm,
      note: item.mistake.explanation ?? undefined,
      mode: "recognition",
      dueAt: item.dueAt,
      priorityScore: priority,
    });
  }

  cards.sort((a, b) => b.priorityScore - a.priorityScore);
  return cards.slice(0, limit);
}

export async function getDueReviewCount(userId: string): Promise<number> {
  const now = new Date();
  const [vocab, items] = await Promise.all([
    db.userVocabulary.count({ where: { userId, nextReviewAt: { lte: now }, status: { not: "NEW" } } }),
    db.reviewItem.count({ where: { userId, dueAt: { lte: now } } }),
  ]);
  return vocab + items;
}

export async function submitReviewOutcome(
  userId: string,
  card: { type: ReviewKind; refId: string; mode: "recognition" | "production" },
  isCorrect: boolean,
  confidence?: "NOT_SURE" | "SOMEWHAT_SURE" | "VERY_SURE",
) {
  if (card.type === "VOCABULARY") {
    return recordVocabularyReview(userId, card.refId, {
      isCorrect,
      confidence,
      wasProduced: card.mode === "production",
    });
  }

  const item = await db.reviewItem.findUniqueOrThrow({ where: { id: card.refId } });
  if (item.userId !== userId) throw new Error("Forbidden");

  const quality: Quality = qualityFromOutcome(isCorrect, confidence);
  const srsResult = scheduleNext({ easeFactor: item.easeFactor, intervalDays: item.intervalDays, repetitions: item.repetitions }, quality);

  await db.reviewItem.update({
    where: { id: item.id },
    data: {
      easeFactor: srsResult.easeFactor,
      intervalDays: srsResult.intervalDays,
      repetitions: srsResult.repetitions,
      dueAt: srsResult.nextReviewAt,
      lastReviewedAt: new Date(),
      forgettingProbability: isCorrect ? Math.max(0.1, item.forgettingProbability - 0.15) : Math.min(0.9, item.forgettingProbability + 0.2),
    },
  });

  if (card.type === "GRAMMAR") {
    // `card.refId` (== item.id) addresses the ReviewItem row itself;
    // `item.refId` is the GrammarTopic id it tracks.
    await applyGrammarPracticeOutcome(userId, item.refId, isCorrect);
  }

  if (card.type === "MISTAKE" && isCorrect && srsResult.repetitions >= 2) {
    await db.mistake.update({ where: { id: item.mistakeId ?? item.refId }, data: { resolved: true } }).catch(() => {});
  }

  const xp = isCorrect ? 5 : 1;
  await updateStreakAndXp(userId, xp, {});
  return { nextReviewAt: srsResult.nextReviewAt };
}

/** Rough continuous CEFR importance weight — not currently used for filtering, reserved for future per-level relevance tuning. */
export function itemImportanceForLevel(itemLevel: string, userLevel: string): number {
  const diff = Math.abs(toContinuous(itemLevel as never, 0) - toContinuous(userLevel as never, 0));
  return Math.max(0.2, 1 - diff * 0.15);
}
