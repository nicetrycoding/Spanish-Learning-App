import "server-only";
import { db } from "@/lib/db";

export async function getProgressOverview(userId: string) {
  const [profile, progress, skillProfile, grammarProgress, vocabStats, mistakeCounts, achievements, unlockedAchievements] =
    await Promise.all([
      db.profile.findUnique({ where: { userId } }),
      db.userProgress.findUnique({ where: { userId } }),
      db.skillProfile.findUnique({ where: { userId } }),
      db.userGrammarProgress.findMany({ where: { userId } }),
      db.userVocabulary.aggregate({ where: { userId }, _avg: { mastery: true }, _count: true }),
      getMistakeTrend(userId),
      db.achievement.findMany(),
      db.userAchievement.findMany({ where: { userId } }),
    ]);

  const avgGrammarMastery = grammarProgress.length
    ? Math.round(grammarProgress.reduce((sum, g) => sum + g.mastery, 0) / grammarProgress.length)
    : 0;

  const unlockedIds = new Set(unlockedAchievements.map((u) => u.achievementId));

  return {
    profile,
    progress,
    skillProfile,
    avgGrammarMastery,
    avgVocabMastery: Math.round(vocabStats._avg.mastery ?? 0),
    vocabCount: vocabStats._count,
    mistakeCounts,
    achievements: achievements.map((a) => ({ ...a, unlocked: unlockedIds.has(a.id) })),
  };
}

async function getMistakeTrend(userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86_400_000);

  const [recent, prior] = await Promise.all([
    db.mistake.count({ where: { userId, lastOccurredAt: { gte: sevenDaysAgo } } }),
    db.mistake.count({ where: { userId, lastOccurredAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);

  return { recent, prior, trend: recent < prior ? "down" : recent > prior ? "up" : "flat" };
}
