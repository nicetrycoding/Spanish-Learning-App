import "server-only";
import type { CEFRLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { CEFR_LEVELS, levelIndex } from "@/lib/cefr";

export async function getCourseLevels() {
  return db.courseLevel.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { modules: true } } },
  });
}

export async function getCourseLevelOverview(level: CEFRLevel, userId: string) {
  const courseLevel = await db.courseLevel.findUnique({
    where: { level },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { exercises: { select: { id: true } } },
          },
        },
      },
    },
  });
  if (!courseLevel) return null;

  const allExerciseIds = courseLevel.modules.flatMap((m) => m.lessons.flatMap((l) => l.exercises.map((e) => e.id)));
  const completedExerciseIds = await getCorrectlyCompletedExerciseIds(userId, allExerciseIds);

  const modules = courseLevel.modules.map((mod) => {
    const lessons = mod.lessons.map((lesson) => {
      const total = lesson.exercises.length;
      const done = lesson.exercises.filter((e) => completedExerciseIds.has(e.id)).length;
      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        type: lesson.type,
        estimatedMinutes: lesson.estimatedMinutes,
        skillTags: lesson.skillTags,
        totalExercises: total,
        completedExercises: done,
        isComplete: total > 0 && done === total,
      };
    });
    const moduleComplete = lessons.length > 0 && lessons.every((l) => l.isComplete);
    return { id: mod.id, slug: mod.slug, title: mod.title, description: mod.description, lessons, isComplete: moduleComplete };
  });

  return { id: courseLevel.id, level: courseLevel.level, title: courseLevel.title, description: courseLevel.description, modules };
}

async function getCorrectlyCompletedExerciseIds(userId: string, exerciseIds: string[]): Promise<Set<string>> {
  if (exerciseIds.length === 0) return new Set();
  const attempts = await db.exerciseAttempt.findMany({
    where: { userId, exerciseId: { in: exerciseIds }, isCorrect: true },
    select: { exerciseId: true },
    distinct: ["exerciseId"],
  });
  return new Set(attempts.map((a) => a.exerciseId));
}

export async function getLessonRunnerData(lessonSlug: string, userId: string) {
  const lesson = await db.lesson.findUnique({
    where: { slug: lessonSlug },
    include: {
      exercises: true,
      module: { include: { courseLevel: true } },
    },
  });
  if (!lesson) return null;

  const exerciseIds = lesson.exercises.map((e) => e.id);
  const completedExerciseIds = await getCorrectlyCompletedExerciseIds(userId, exerciseIds);

  return { lesson, completedExerciseIds };
}

/**
 * The core "what should I study right now?" lookup: the first incomplete
 * lesson in the learner's current overall level, walking forward into
 * later levels if the current one is fully done.
 */
export async function getRecommendedNextLesson(userId: string) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const startLevel = skillProfile?.overallLevel ?? "A0";
  const startIndex = levelIndex(startLevel);

  for (let i = startIndex; i < CEFR_LEVELS.length; i++) {
    const overview = await getCourseLevelOverview(CEFR_LEVELS[i], userId);
    if (!overview) continue;
    for (const mod of overview.modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.isComplete) {
          return { lesson, module: mod, level: overview.level };
        }
      }
    }
  }
  return null;
}

export async function isLessonFullyComplete(lessonId: string, userId: string): Promise<boolean> {
  const exercises = await db.exercise.findMany({ where: { lessonId }, select: { id: true } });
  if (exercises.length === 0) return false;
  const completed = await getCorrectlyCompletedExerciseIds(
    userId,
    exercises.map((e) => e.id),
  );
  return exercises.every((e) => completed.has(e.id));
}
