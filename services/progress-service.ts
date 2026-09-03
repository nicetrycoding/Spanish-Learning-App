import "server-only";
import { db } from "@/lib/db";

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function isYesterday(a: Date, b: Date): boolean {
  const yesterday = new Date(b);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(a, yesterday);
}

export interface ProgressIncrements {
  exercisesCompleted?: number;
  lessonsCompleted?: number;
  wordsMastered?: number;
  studyMinutes?: number;
}

/**
 * Central place where XP, streaks, and coarse progress counters are
 * updated. Called after any graded activity (exercise, review, writing
 * submission, etc.) so streak/XP logic lives in exactly one place.
 */
export async function updateStreakAndXp(
  userId: string,
  xpEarned: number,
  increments: ProgressIncrements = {},
) {
  const existing = await db.userProgress.findUnique({ where: { userId } });
  const now = new Date();

  let currentStreak = existing?.currentStreak ?? 0;
  let longestStreak = existing?.longestStreak ?? 0;
  const last = existing?.lastActivityDate ?? null;

  if (!last) {
    currentStreak = 1;
  } else if (isSameDay(last, now)) {
    // already active today — streak unchanged
  } else if (isYesterday(last, now)) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  await db.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      totalXp: xpEarned,
      currentStreak,
      longestStreak,
      lastActivityDate: now,
      exercisesCompleted: increments.exercisesCompleted ?? 0,
      lessonsCompleted: increments.lessonsCompleted ?? 0,
      wordsMastered: increments.wordsMastered ?? 0,
      studyMinutesTotal: increments.studyMinutes ?? 0,
    },
    update: {
      totalXp: { increment: xpEarned },
      currentStreak,
      longestStreak,
      lastActivityDate: now,
      exercisesCompleted: { increment: increments.exercisesCompleted ?? 0 },
      lessonsCompleted: { increment: increments.lessonsCompleted ?? 0 },
      wordsMastered: { increment: increments.wordsMastered ?? 0 },
      studyMinutesTotal: { increment: increments.studyMinutes ?? 0 },
    },
  });
}
