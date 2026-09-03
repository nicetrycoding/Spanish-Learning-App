import "server-only";
import { db } from "@/lib/db";
import { CEFR_LEVELS } from "@/lib/cefr";

export async function getGrammarTopicsByLevel(userId: string) {
  const [topics, progress] = await Promise.all([
    db.grammarTopic.findMany({ orderBy: [{ cefrLevel: "asc" }, { order: "asc" }] }),
    db.userGrammarProgress.findMany({ where: { userId } }),
  ]);
  const progressByTopic = new Map(progress.map((p) => [p.grammarTopicId, p]));

  return CEFR_LEVELS.map((level) => ({
    level,
    topics: topics
      .filter((t) => t.cefrLevel === level)
      .map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        summary: t.summary,
        mastery: progressByTopic.get(t.id)?.mastery ?? 0,
      })),
  })).filter((group) => group.topics.length > 0);
}

export async function getGrammarTopicDetail(slug: string, userId: string) {
  const topic = await db.grammarTopic.findUnique({ where: { slug } });
  if (!topic) return null;
  const progress = await db.userGrammarProgress.findUnique({
    where: { userId_grammarTopicId: { userId, grammarTopicId: topic.id } },
  });
  const relatedTopics = topic.relatedTopicSlugs.length
    ? await db.grammarTopic.findMany({ where: { slug: { in: topic.relatedTopicSlugs } }, select: { slug: true, title: true } })
    : [];
  return { topic, progress, relatedTopics };
}

export async function getGrammarPracticeSet(topicId: string) {
  const topic = await db.grammarTopic.findUniqueOrThrow({ where: { id: topicId } });
  return db.exercise.findMany({
    where: { skillTag: "GRAMMAR", cefrLevel: topic.cefrLevel },
    take: 6,
  });
}

/**
 * Applies one practice outcome (right/wrong) to a learner's mastery of a
 * specific grammar topic — shared by the topic's own "Practice this topic"
 * flow and the unified review queue (services/review-service.ts) so
 * mastery math lives in exactly one place.
 */
export async function applyGrammarPracticeOutcome(userId: string, topicId: string, isCorrect: boolean) {
  const progress = await db.userGrammarProgress.upsert({
    where: { userId_grammarTopicId: { userId, grammarTopicId: topicId } },
    create: { userId, grammarTopicId: topicId },
    update: {},
  });

  const attempts = progress.attempts + 1;
  const correctCount = progress.correctCount + (isCorrect ? 1 : 0);
  const accuracy = Math.round((correctCount / attempts) * 100);
  const mastery = Math.round(Math.min(100, progress.mastery * 0.7 + (isCorrect ? 100 : 20) * 0.3));

  await db.userGrammarProgress.update({
    where: { id: progress.id },
    data: { attempts, correctCount, accuracy, mastery, lastPracticedAt: new Date() },
  });

  // Below-mastery topics resurface in the unified review queue automatically.
  if (mastery < 60 && attempts >= 2) {
    await db.reviewItem.upsert({
      where: { userId_itemType_refId: { userId, itemType: "GRAMMAR", refId: topicId } },
      create: {
        userId,
        itemType: "GRAMMAR",
        refId: topicId,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        importance: 0.7,
        errorFrequency: attempts - correctCount,
      },
      update: { errorFrequency: attempts - correctCount, importance: 0.7 },
    });
  }

  return { mastery, accuracy };
}
