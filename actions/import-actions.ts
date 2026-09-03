"use server";

import { redirect } from "next/navigation";
import type { ContentImportSource } from "@prisma/client";
import { auth } from "@/lib/auth";
import { importContent } from "@/services/content-import-service";
import { generateCustomLesson, generateLessonFromImport } from "@/services/lesson-generator-service";

export async function importContentAction(sourceType: ContentImportSource, rawText: string, title?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const record = await importContent(session.user.id, sourceType, rawText, title);
  return record.id;
}

export async function generateLessonFromImportAction(contentImportId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const lesson = await generateLessonFromImport(session.user.id, contentImportId);
  redirect(`/learn/generated/${lesson.id}`);
}

export async function generateCustomLessonAction(topic: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const lesson = await generateCustomLesson(session.user.id, topic);
  redirect(`/learn/generated/${lesson.id}`);
}
