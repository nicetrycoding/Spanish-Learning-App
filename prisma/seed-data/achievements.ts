import type { Prisma } from "@prisma/client";

type AchievementSeed = Omit<Prisma.AchievementCreateInput, "users">;

export const ACHIEVEMENTS: AchievementSeed[] = [
  { key: "first_lesson", title: "First Lesson", description: "Complete your first lesson.", icon: "🎯", criteria: { metric: "lessonsCompleted", threshold: 1 } },
  { key: "five_lessons", title: "Getting Into It", description: "Complete 5 lessons.", icon: "📘", criteria: { metric: "lessonsCompleted", threshold: 5 } },
  { key: "hundred_exercises", title: "Century Club", description: "Complete 100 exercises.", icon: "💯", criteria: { metric: "exercisesCompleted", threshold: 100 } },
  { key: "streak_7", title: "One Week Strong", description: "Keep a 7-day streak.", icon: "🔥", criteria: { metric: "currentStreak", threshold: 7 } },
  { key: "streak_30", title: "Unstoppable", description: "Keep a 30-day streak.", icon: "⚡", criteria: { metric: "currentStreak", threshold: 30 } },
  { key: "hundred_words", title: "Word Collector", description: "Master 100 words.", icon: "📚", criteria: { metric: "wordsMastered", threshold: 100 } },
  { key: "first_conversation", title: "First Conversation", description: "Complete your first AI conversation.", icon: "💬", criteria: { metric: "conversationsStarted", threshold: 1 } },
  { key: "first_writing", title: "First Draft", description: "Submit your first writing task.", icon: "✍️", criteria: { metric: "writingSubmissions", threshold: 1 } },
  { key: "ten_mistakes_resolved", title: "Sharp Eye", description: "Resolve 10 recurring mistakes.", icon: "🔍", criteria: { metric: "mistakesResolved", threshold: 10 } },
  { key: "reached_b1", title: "Solidly Intermediate", description: "Reach B1 or above on an assessment.", icon: "🏆", criteria: { metric: "assessmentAtOrAboveB1", threshold: 1 } },
];
