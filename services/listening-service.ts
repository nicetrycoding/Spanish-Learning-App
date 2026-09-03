import "server-only";
import type { CEFRLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { updateStreakAndXp } from "@/services/progress-service";

export async function getListeningExercises(cefrLevel?: CEFRLevel) {
  return db.listeningExercise.findMany({
    where: cefrLevel ? { cefrLevel } : undefined,
    orderBy: { cefrLevel: "asc" },
  });
}

export async function getListeningExercise(id: string) {
  return db.listeningExercise.findUnique({ where: { id } });
}

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export async function submitListeningAttempt(userId: string, exerciseId: string, answers: Record<string, number>) {
  const exercise = await db.listeningExercise.findUniqueOrThrow({ where: { id: exerciseId } });
  const questions = exercise.questions as unknown as ComprehensionQuestion[];

  const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const comprehensionScore = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const keyExpressions = exercise.keyExpressions as unknown as { es: string; en: string }[];
  const missedExpressions = comprehensionScore < 80 ? keyExpressions.map((k) => k.es) : [];

  await db.listeningAttempt.create({
    data: { userId, listeningExerciseId: exerciseId, comprehensionScore, missedExpressions, answers },
  });

  // Difficult expressions automatically queue for review, per the product spec.
  for (const expr of comprehensionScore < 80 ? keyExpressions : []) {
    const mistake = await db.mistake.upsert({
      where: { id: `listening-${userId}-${exerciseId}-${slugify(expr.es)}` },
      create: {
        id: `listening-${userId}-${exerciseId}-${slugify(expr.es)}`,
        userId,
        category: "LISTENING",
        sourceType: "LISTENING",
        sourceId: exerciseId,
        userInput: `(missed) ${expr.es}`,
        correctForm: `${expr.es} — ${expr.en}`,
        explanation: `This expression came up in a listening exercise you found difficult.`,
        cefrLevel: exercise.cefrLevel,
      },
      update: { occurrenceCount: { increment: 1 }, lastOccurredAt: new Date(), resolved: false },
    });
    await db.reviewItem.upsert({
      where: { userId_itemType_refId: { userId, itemType: "MISTAKE", refId: mistake.id } },
      create: {
        userId,
        itemType: "MISTAKE",
        refId: mistake.id,
        mistakeId: mistake.id,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
        importance: 0.6,
      },
      update: { dueAt: new Date(Date.now() + 1000 * 60 * 60 * 6) },
    });
  }

  await updateStreakAndXp(userId, comprehensionScore >= 80 ? 15 : 8, { studyMinutes: 4 });

  return { comprehensionScore, missedExpressions, correctCount, totalQuestions: questions.length };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}
