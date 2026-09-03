import "server-only";
import type { MistakeCategory, SkillType } from "@prisma/client";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import type { MistakeExplanation } from "@/lib/ai/schemas";

const CATEGORY_LABEL: Record<MistakeCategory, string> = {
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
  WORD_ORDER: "Word order",
  PREPOSITION: "Prepositions",
  CONJUGATION: "Verb conjugation",
  GENDER: "Noun gender",
  LISTENING: "Listening",
  WRITING: "Writing",
  PRONUNCIATION: "Pronunciation",
};

const CATEGORY_TO_SKILL: Record<MistakeCategory, SkillType> = {
  GRAMMAR: "GRAMMAR",
  VOCABULARY: "VOCABULARY",
  WORD_ORDER: "GRAMMAR",
  PREPOSITION: "GRAMMAR",
  CONJUGATION: "GRAMMAR",
  GENDER: "GRAMMAR",
  LISTENING: "LISTENING",
  WRITING: "WRITING",
  PRONUNCIATION: "SPEAKING",
};

export async function getMistakesGrouped(userId: string) {
  const mistakes = await db.mistake.findMany({
    where: { userId, resolved: false },
    orderBy: [{ occurrenceCount: "desc" }, { lastOccurredAt: "desc" }],
  });

  const groups = new Map<MistakeCategory, typeof mistakes>();
  for (const m of mistakes) {
    const list = groups.get(m.category) ?? [];
    list.push(m);
    groups.set(m.category, list);
  }

  return Array.from(groups.entries())
    .map(([category, items]) => ({ category, label: CATEGORY_LABEL[category], items }))
    .sort((a, b) => b.items.length - a.items.length);
}

export async function getResolvedMistakeCount(userId: string) {
  return db.mistake.count({ where: { userId, resolved: true } });
}

export async function explainMistakeForUser(userId: string, mistakeId: string): Promise<MistakeExplanation> {
  const mistake = await db.mistake.findUniqueOrThrow({ where: { id: mistakeId } });
  if (mistake.userId !== userId) throw new Error("Forbidden");

  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  return AIService.explainMistake({
    userInput: mistake.userInput,
    correctForm: mistake.correctForm,
    category: mistake.category,
    baseExplanation: mistake.explanation,
    learner: { level: skillProfile?.overallLevel ?? "A1" },
  });
}

export async function getTargetedPracticeForMistake(mistakeId: string, count = 5) {
  const mistake = await db.mistake.findUniqueOrThrow({ where: { id: mistakeId } });
  const skill = CATEGORY_TO_SKILL[mistake.category];
  return db.exercise.findMany({
    where: { skillTag: skill, cefrLevel: mistake.cefrLevel ?? undefined },
    take: count,
  });
}

export async function resolveMistake(userId: string, mistakeId: string) {
  const mistake = await db.mistake.findUniqueOrThrow({ where: { id: mistakeId } });
  if (mistake.userId !== userId) throw new Error("Forbidden");
  await db.mistake.update({ where: { id: mistakeId }, data: { resolved: true } });
}
