import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Circle, Lock, TrendingDown, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { getProgressOverview } from "@/services/progress-overview-service";
import { statementsWithStatus } from "@/lib/progress/can-do-statements";
import { SKILL_LABELS, formatSubLevel, LEVEL_COLOR_VAR, type SkillKey } from "@/lib/cefr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getProgressOverview(session.user.id);
  if (!data.skillProfile) redirect("/onboarding");

  const skillRows: { skill: SkillKey; level: string; sub: number }[] = [
    { skill: "GRAMMAR", level: data.skillProfile.grammarLevel, sub: data.skillProfile.grammarSub },
    { skill: "VOCABULARY", level: data.skillProfile.vocabularyLevel, sub: data.skillProfile.vocabularySub },
    { skill: "READING", level: data.skillProfile.readingLevel, sub: data.skillProfile.readingSub },
    { skill: "LISTENING", level: data.skillProfile.listeningLevel, sub: data.skillProfile.listeningSub },
    { skill: "WRITING", level: data.skillProfile.writingLevel, sub: data.skillProfile.writingSub },
    { skill: "SPEAKING", level: data.skillProfile.speakingLevel, sub: data.skillProfile.speakingSub },
  ];

  const statements = statementsWithStatus(data.skillProfile.overallLevel, data.skillProfile.overallSub);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Progress</h1>
        <p className="mt-1 text-muted-foreground">What you can actually do, not just what you've clicked through.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total XP" value={String(data.progress?.totalXp ?? 0)} />
        <StatCard label="Study time" value={formatMinutes(data.progress?.studyMinutesTotal ?? 0)} />
        <StatCard label="Current streak" value={`${data.progress?.currentStreak ?? 0} days`} />
        <StatCard label="Lessons completed" value={String(data.progress?.lessonsCompleted ?? 0)} />
        <StatCard label="Vocabulary mastery (avg)" value={`${data.avgVocabMastery}%`} />
        <StatCard label="Grammar mastery (avg)" value={`${data.avgGrammarMastery}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent mistake frequency</CardTitle>
            {data.mistakeCounts.trend !== "flat" && (
              <Badge variant={data.mistakeCounts.trend === "down" ? "success" : "warning"}>
                {data.mistakeCounts.trend === "down" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {data.mistakeCounts.trend === "down" ? "Improving" : "Rising"}
              </Badge>
            )}
          </div>
          <CardDescription>
            {data.mistakeCounts.recent} mistakes this week vs. {data.mistakeCounts.prior} the week before
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you can do</CardTitle>
          <CardDescription>Competence, not just completion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {statements.map((s) => (
            <div key={s.statement} className="flex items-center gap-2 text-sm">
              {s.status === "done" && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
              {s.status === "in_progress" && <Circle className="h-4 w-4 shrink-0 text-primary" />}
              {s.status === "upcoming" && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <span
                className={cn(
                  s.status === "done" && "text-foreground",
                  s.status === "in_progress" && "font-medium text-foreground",
                  s.status === "upcoming" && "text-muted-foreground",
                )}
              >
                {s.statement}
              </span>
              <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                {s.level}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center",
                a.unlocked ? "border-primary/30 bg-primary/5" : "border-border opacity-50",
              )}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-medium">{a.title}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
