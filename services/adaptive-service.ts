import "server-only";
import { db } from "@/lib/db";
import { SKILL_LABELS, toContinuous, type SkillKey } from "@/lib/cefr";

export interface WeakArea {
  label: string;
  reason: string;
}

const SKILL_FIELD: Record<SkillKey, { level: string; sub: string }> = {
  GRAMMAR: { level: "grammarLevel", sub: "grammarSub" },
  VOCABULARY: { level: "vocabularyLevel", sub: "vocabularySub" },
  READING: { level: "readingLevel", sub: "readingSub" },
  LISTENING: { level: "listeningLevel", sub: "listeningSub" },
  WRITING: { level: "writingLevel", sub: "writingSub" },
  SPEAKING: { level: "speakingLevel", sub: "speakingSub" },
};

const MISTAKE_CATEGORY_LABEL: Record<string, string> = {
  GRAMMAR: "Grammar accuracy",
  VOCABULARY: "Vocabulary recall",
  WORD_ORDER: "Word order",
  PREPOSITION: "Prepositions",
  CONJUGATION: "Verb conjugation",
  GENDER: "Noun gender",
  LISTENING: "Listening comprehension",
  WRITING: "Writing accuracy",
  PRONUNCIATION: "Pronunciation",
};

/**
 * Combines the skill profile's weakest dimensions with recurring mistake
 * patterns and low-mastery grammar topics into a short, actionable list —
 * this is what the dashboard shows as "Your weak areas" and what the daily
 * session composer (services/daily-session-service.ts) prioritizes.
 */
export async function getDashboardWeakAreas(userId: string, limit = 4): Promise<WeakArea[]> {
  const [skillProfile, mistakeGroups, weakGrammar] = await Promise.all([
    db.skillProfile.findUnique({ where: { userId } }),
    db.mistake.groupBy({
      by: ["category"],
      where: { userId, resolved: false },
      _sum: { occurrenceCount: true },
      orderBy: { _sum: { occurrenceCount: "desc" } },
      take: 3,
    }),
    db.userGrammarProgress.findMany({
      where: { userId, attempts: { gt: 0 }, mastery: { lt: 45 } },
      orderBy: { mastery: "asc" },
      take: 2,
      include: { grammarTopic: { select: { title: true } } },
    }),
  ]);

  const results: WeakArea[] = [];

  if (skillProfile) {
    const continuous = (Object.keys(SKILL_FIELD) as SkillKey[]).map((skill) => {
      const field = SKILL_FIELD[skill];
      const level = skillProfile[field.level as keyof typeof skillProfile] as never;
      const sub = skillProfile[field.sub as keyof typeof skillProfile] as number;
      return { skill, value: toContinuous(level, sub) };
    });
    continuous.sort((a, b) => a.value - b.value);
    const weakest = continuous[0];
    if (weakest) {
      results.push({ label: SKILL_LABELS[weakest.skill], reason: "Lowest skill" });
    }
  }

  for (const group of mistakeGroups) {
    const count = group._sum.occurrenceCount ?? 0;
    if (count < 2) continue;
    const label = MISTAKE_CATEGORY_LABEL[group.category] ?? group.category;
    if (results.some((r) => r.label === label)) continue;
    results.push({ label, reason: `${count} repeated mistakes` });
  }

  for (const g of weakGrammar) {
    if (results.some((r) => r.label === g.grammarTopic.title)) continue;
    results.push({ label: g.grammarTopic.title, reason: `${Math.round(g.mastery)}% mastery` });
  }

  return results.slice(0, limit);
}
