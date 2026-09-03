import "server-only";
import { db } from "@/lib/db";
import { getDueReviewCount } from "@/services/review-service";
import { getRecommendedNextLesson } from "@/services/content-service";
import { SKILL_LABELS, toContinuous, type SkillKey } from "@/lib/cefr";

export interface DailyActivity {
  type: "review" | "lesson" | SkillKey;
  label: string;
  minutes: number;
  href: string;
}

const SKILL_FIELD: Record<SkillKey, { level: string; sub: string }> = {
  GRAMMAR: { level: "grammarLevel", sub: "grammarSub" },
  VOCABULARY: { level: "vocabularyLevel", sub: "vocabularySub" },
  READING: { level: "readingLevel", sub: "readingSub" },
  LISTENING: { level: "listeningLevel", sub: "listeningSub" },
  WRITING: { level: "writingLevel", sub: "writingSub" },
  SPEAKING: { level: "speakingLevel", sub: "speakingSub" },
};

/**
 * Composes "Daily Spanish" — a short, personalized session built entirely
 * from deterministic rules (no AI call — see AIService's cost-optimization
 * philosophy: only call AI when interpretation/generation is genuinely
 * needed). Allocation order: overdue review first, then the next lesson,
 * then the two weakest skills split across the remaining time.
 */
export async function getDailySession(userId: string): Promise<{ totalMinutes: number; activities: DailyActivity[] }> {
  const [profile, skillProfile, dueCount, recommended] = await Promise.all([
    db.profile.findUnique({ where: { userId } }),
    db.skillProfile.findUnique({ where: { userId } }),
    getDueReviewCount(userId),
    getRecommendedNextLesson(userId),
  ]);

  const totalMinutes = profile?.dailyGoalMinutes ?? 10;
  let remaining = totalMinutes;
  const activities: DailyActivity[] = [];

  if (dueCount > 0 && remaining > 0) {
    const minutes = Math.min(remaining, Math.max(2, Math.round(totalMinutes * 0.3)));
    activities.push({ type: "review", label: `Review (${dueCount} due)`, minutes, href: "/practice/review" });
    remaining -= minutes;
  }

  if (recommended && remaining > 0) {
    const minutes = Math.min(remaining, Math.max(2, Math.round(totalMinutes * 0.4)));
    activities.push({ type: "lesson", label: recommended.lesson.title, minutes, href: `/learn/lesson/${recommended.lesson.slug}` });
    remaining -= minutes;
  }

  if (skillProfile && remaining > 0) {
    const skills = (Object.keys(SKILL_FIELD) as SkillKey[])
      .map((skill) => {
        const field = SKILL_FIELD[skill];
        return {
          skill,
          value: toContinuous(skillProfile[field.level as keyof typeof skillProfile] as never, skillProfile[field.sub as keyof typeof skillProfile] as number),
        };
      })
      .sort((a, b) => a.value - b.value)
      .slice(0, remaining >= 4 ? 2 : 1);

    const perSkill = Math.max(1, Math.floor(remaining / skills.length));
    for (const [i, s] of skills.entries()) {
      const minutes = i === skills.length - 1 ? remaining : Math.min(remaining, perSkill);
      if (minutes <= 0) continue;
      activities.push({ type: s.skill, label: `${SKILL_LABELS[s.skill]} practice`, minutes, href: `/practice/${s.skill.toLowerCase()}` });
      remaining -= minutes;
    }
  }

  return { totalMinutes, activities };
}
