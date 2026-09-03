import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Flame, RotateCcw, Sparkles, Target } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecommendedNextLesson } from "@/services/content-service";
import { getDashboardWeakAreas } from "@/services/adaptive-service";
import { getDailySession } from "@/services/daily-session-service";
import { SKILL_LABELS, formatSubLevel, LEVEL_COLOR_VAR, CEFR_LABELS, type SkillKey } from "@/lib/cefr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [profile, progress, skillProfile, recommended, weakAreas, dueReviewCount, vocabMasteredCount, vocabTotalCount, todaysMinutes, dailySession] =
    await Promise.all([
      db.profile.findUnique({ where: { userId } }),
      db.userProgress.findUnique({ where: { userId } }),
      db.skillProfile.findUnique({ where: { userId } }),
      getRecommendedNextLesson(userId),
      getDashboardWeakAreas(userId),
      db.reviewItem.count({ where: { userId, dueAt: { lte: new Date() } } }),
      db.userVocabulary.count({ where: { userId, status: "MASTERED" } }),
      db.userVocabulary.count({ where: { userId } }),
      getTodaysMinutes(userId),
      getDailySession(userId),
    ]);

  const dailyGoal = profile?.dailyGoalMinutes ?? 10;
  const goalPct = Math.min(100, Math.round((todaysMinutes / dailyGoal) * 100));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const skillRows: { skill: SkillKey; level: string; sub: number }[] = skillProfile
    ? [
        { skill: "GRAMMAR", level: skillProfile.grammarLevel, sub: skillProfile.grammarSub },
        { skill: "VOCABULARY", level: skillProfile.vocabularyLevel, sub: skillProfile.vocabularySub },
        { skill: "READING", level: skillProfile.readingLevel, sub: skillProfile.readingSub },
        { skill: "LISTENING", level: skillProfile.listeningLevel, sub: skillProfile.listeningSub },
        { skill: "WRITING", level: skillProfile.writingLevel, sub: skillProfile.writingSub },
        { skill: "SPEAKING", level: skillProfile.speakingLevel, sub: skillProfile.speakingSub },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">
          {greeting}, {session.user.name?.split(" ")[0]}
        </h1>
        {skillProfile && (
          <p className="mt-1 text-muted-foreground">
            {skillProfile.overallLevel} · {CEFR_LABELS[skillProfile.overallLevel as keyof typeof CEFR_LABELS]}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's goal + continue learning */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's goal</CardTitle>
              <span className="text-sm text-muted-foreground">
                {todaysMinutes}/{dailyGoal} min
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Progress value={goalPct} />

            {recommended ? (
              <div className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Continue learning</p>
                  <p className="font-serif-display text-lg font-semibold">{recommended.lesson.title}</p>
                </div>
                <Button asChild>
                  <Link href={`/learn/lesson/${recommended.lesson.slug}`}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                You've completed everything available right now — great work.
              </div>
            )}

            {dueReviewCount > 0 && (
              <div className="flex flex-col justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-accent" />
                  <p className="text-sm">
                    <span className="font-semibold">{dueReviewCount}</span> item{dueReviewCount === 1 ? "" : "s"} due for review
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/practice/review">Review now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak + XP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Momentum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-2.5 text-warning">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold">{progress?.currentStreak ?? 0} day streak</p>
                <p className="text-xs text-muted-foreground">Longest: {progress?.longestStreak ?? 0} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-2.5 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold">{progress?.totalXp ?? 0} XP</p>
                <p className="text-xs text-muted-foreground">{progress?.lessonsCompleted ?? 0} lessons completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dailySession.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Spanish — {dailySession.totalMinutes} minutes</CardTitle>
            <CardDescription>Personalized from your review queue, your next lesson, and your weakest skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dailySession.activities.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span>{a.label}</span>
                <Badge variant="secondary">{a.minutes} min</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Skill profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Skill profile</CardTitle>
            <CardDescription>Six independent skills, each tracked at a fine-grained sub-level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillRows.map((row) => (
              <div key={row.skill} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm font-medium">{SKILL_LABELS[row.skill]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((["A0", "A1", "A2", "B1", "B2", "C1", "C2"].indexOf(row.level) + row.sub) / 7) * 100)}%`,
                      background: LEVEL_COLOR_VAR[row.level as keyof typeof LEVEL_COLOR_VAR],
                    }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-sm">{formatSubLevel(row.level as never, row.sub)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weak areas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your weak areas</CardTitle>
            <CardDescription>Where to focus next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough data yet — keep practicing.</p>
            ) : (
              weakAreas.map((w) => (
                <div key={w.label} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                  <span className="text-sm">{w.label}</span>
                  <Badge variant="warning">{w.reason}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">
                {vocabMasteredCount} / {vocabTotalCount || vocabMasteredCount}
              </p>
              <p className="text-xs text-muted-foreground">Vocabulary mastered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-success/10 p-3 text-success">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">{progress?.exercisesCompleted ?? 0}</p>
              <p className="text-xs text-muted-foreground">Exercises completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function getTodaysMinutes(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sessions = await db.learningSession.findMany({
    where: { userId, startedAt: { gte: startOfDay } },
    select: { durationMinutes: true },
  });
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}
