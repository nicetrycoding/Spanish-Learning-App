import "server-only";
import { db } from "@/lib/db";
import { levelIndex, type CEFRLevelKey } from "@/lib/cefr";

interface AchievementCriteria {
  metric:
    | "lessonsCompleted"
    | "exercisesCompleted"
    | "currentStreak"
    | "wordsMastered"
    | "mistakesResolved"
    | "conversationsStarted"
    | "writingSubmissions"
    | "assessmentAtOrAboveB1";
  threshold: number;
}

async function computeMetrics(userId: string): Promise<Record<AchievementCriteria["metric"], number>> {
  const [progress, mistakesResolved, conversationsStarted, writingSubmissions, assessments] = await Promise.all([
    db.userProgress.findUnique({ where: { userId } }),
    db.mistake.count({ where: { userId, resolved: true } }),
    db.conversation.count({ where: { userId } }),
    db.writingSubmission.count({ where: { userId } }),
    db.assessment.findMany({ where: { userId }, select: { overallLevel: true } }),
  ]);

  const hasB1Plus = assessments.some((a) => a.overallLevel && levelIndex(a.overallLevel as CEFRLevelKey) >= levelIndex("B1"));

  return {
    lessonsCompleted: progress?.lessonsCompleted ?? 0,
    exercisesCompleted: progress?.exercisesCompleted ?? 0,
    currentStreak: progress?.currentStreak ?? 0,
    wordsMastered: progress?.wordsMastered ?? 0,
    mistakesResolved,
    conversationsStarted,
    writingSubmissions,
    assessmentAtOrAboveB1: hasB1Plus ? 1 : 0,
  };
}

/** Checks every achievement not yet unlocked by the user and unlocks any newly met. Cheap enough to call after any graded activity. */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const [achievements, unlocked] = await Promise.all([
    db.achievement.findMany(),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const remaining = achievements.filter((a) => !unlockedIds.has(a.id));
  if (remaining.length === 0) return [];

  const metrics = await computeMetrics(userId);
  const newlyUnlocked: string[] = [];

  for (const achievement of remaining) {
    const criteria = achievement.criteria as unknown as AchievementCriteria;
    const value = metrics[criteria.metric] ?? 0;
    if (value >= criteria.threshold) {
      await db.userAchievement.create({ data: { userId, achievementId: achievement.id } });
      newlyUnlocked.push(achievement.key);
    }
  }
  return newlyUnlocked;
}
