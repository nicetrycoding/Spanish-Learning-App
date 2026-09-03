import "server-only";
import { db } from "@/lib/db";
import { updateStreakAndXp } from "@/services/progress-service";

export async function getStoriesWithProgress(userId: string) {
  const [stories, progress] = await Promise.all([
    db.story.findMany({ include: { _count: { select: { steps: true } } } }),
    db.userStoryProgress.findMany({ where: { userId } }),
  ]);
  const progressByStory = new Map(progress.map((p) => [p.storyId, p]));
  return stories.map((s) => ({
    ...s,
    status: progressByStory.get(s.id)?.completed ? "completed" : progressByStory.has(s.id) ? "in_progress" : "not_started",
  }));
}

export async function getStoryRunnerData(slug: string, userId: string) {
  const story = await db.story.findUnique({ where: { slug }, include: { steps: true } });
  if (!story) return null;

  const progress = await db.userStoryProgress.upsert({
    where: { userId_storyId: { userId, storyId: story.id } },
    create: { userId, storyId: story.id, currentStepKey: story.startStepKey },
    update: {},
  });

  return { story, progress };
}

export async function chooseStoryOption(userId: string, storyId: string, nextStepKey: string, choiceLabel: string) {
  const progress = await db.userStoryProgress.findUniqueOrThrow({ where: { userId_storyId: { userId, storyId } } });
  if (progress.userId !== userId) throw new Error("Forbidden");

  const nextStep = await db.storyStep.findFirst({ where: { storyId, stepKey: nextStepKey } });
  if (!nextStep) throw new Error("Invalid story step");

  const choicesMade = [...(progress.choicesMade as unknown as string[]), choiceLabel];
  const completed = nextStep.isEnding;

  await db.userStoryProgress.update({
    where: { id: progress.id },
    data: {
      currentStepKey: nextStepKey,
      choicesMade: choicesMade as unknown as object,
      completed,
      completedAt: completed ? new Date() : undefined,
    },
  });

  if (completed) {
    await updateStreakAndXp(userId, 25, { studyMinutes: 6 });
  }

  return { nextStep, completed };
}
