import "server-only";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import type { ContentExtraction } from "@/lib/ai/schemas";
import { updateStreakAndXp } from "@/services/progress-service";

async function seedVocabularyForTopic(topic: string) {
  const keywords = topic
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);

  const matches = await db.vocabulary.findMany({
    where: {
      OR: [
        { tags: { hasSome: keywords } },
        ...keywords.map((k) => ({ translation: { contains: k, mode: "insensitive" as const } })),
      ],
    },
    take: 10,
  });

  return matches.map((v) => ({ es: v.spanish, en: v.translation, example: v.exampleEs }));
}

export async function generateCustomLesson(userId: string, topic: string) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const fallbackVocabulary = await seedVocabularyForTopic(topic);

  const content = await AIService.generateLesson({
    topic,
    learner: { level: skillProfile?.overallLevel ?? "A2" },
    fallbackVocabulary,
  });

  const generated = await db.generatedLesson.create({
    data: { userId, topic, cefrLevel: skillProfile?.overallLevel ?? "A2", content: content as unknown as object },
  });

  await updateStreakAndXp(userId, 10, {});
  return generated;
}

export async function generateLessonFromImport(userId: string, contentImportId: string) {
  const contentImport = await db.contentImport.findUniqueOrThrow({ where: { id: contentImportId } });
  if (contentImport.userId !== userId) throw new Error("Forbidden");

  const extraction = contentImport.extraction as unknown as ContentExtraction | null;
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });

  const content = await AIService.generateLesson({
    topic: contentImport.title ?? "imported content",
    learner: { level: skillProfile?.overallLevel ?? "A2" },
    fallbackVocabulary: (extraction?.vocabulary ?? []).map((v) => ({ es: v.es, en: v.en, example: v.es })),
  });

  const generated = await db.generatedLesson.create({
    data: {
      userId,
      contentImportId,
      topic: contentImport.title ?? "Imported lesson",
      cefrLevel: extraction?.cefrEstimate ?? skillProfile?.overallLevel ?? "A2",
      content: content as unknown as object,
    },
  });

  await updateStreakAndXp(userId, 10, {});
  return generated;
}

export async function getGeneratedLesson(userId: string, id: string) {
  const lesson = await db.generatedLesson.findUnique({ where: { id } });
  if (!lesson || lesson.userId !== userId) return null;
  return lesson;
}
