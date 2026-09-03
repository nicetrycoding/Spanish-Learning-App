import "server-only";
import type { ContentImportSource } from "@prisma/client";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import { updateStreakAndXp } from "@/services/progress-service";

export async function importContent(userId: string, sourceType: ContentImportSource, rawText: string, title?: string) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const extraction = await AIService.extractContent({ rawText, learner: { level: skillProfile?.overallLevel ?? "A2" } });

  const contentImport = await db.contentImport.create({
    data: {
      userId,
      sourceType,
      title: title || rawText.slice(0, 60),
      rawText,
      cefrEstimate: extraction.cefrEstimate,
      extraction: extraction as unknown as object,
    },
  });

  await updateStreakAndXp(userId, 10, {});
  return contentImport;
}

export async function getContentImport(userId: string, id: string) {
  const record = await db.contentImport.findUnique({ where: { id } });
  if (!record || record.userId !== userId) return null;
  return record;
}

export async function getContentImportHistory(userId: string) {
  return db.contentImport.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 });
}
