import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SKILL_LABELS, formatSubLevel, LEVEL_COLOR_VAR, type SkillKey } from "@/lib/cefr";

export const metadata: Metadata = { title: "Your placement results" };

export default async function PlacementResultPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [assessment, skillProfile] = await Promise.all([
    db.assessment.findFirst({
      where: { userId: session.user.id, type: "PLACEMENT" },
      orderBy: { completedAt: "desc" },
      include: { results: true },
    }),
    db.skillProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!assessment || !skillProfile) redirect("/placement-test");

  const skillRows: { skill: SkillKey; level: string; sub: number }[] = [
    { skill: "GRAMMAR", level: skillProfile.grammarLevel, sub: skillProfile.grammarSub },
    { skill: "VOCABULARY", level: skillProfile.vocabularyLevel, sub: skillProfile.vocabularySub },
    { skill: "READING", level: skillProfile.readingLevel, sub: skillProfile.readingSub },
    { skill: "LISTENING", level: skillProfile.listeningLevel, sub: skillProfile.listeningSub },
    { skill: "WRITING", level: skillProfile.writingLevel, sub: skillProfile.writingSub },
    { skill: "SPEAKING", level: skillProfile.speakingLevel, sub: skillProfile.speakingSub },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">Placement complete</Badge>
        <h1 className="font-serif-display text-3xl font-semibold">
          Your overall level: <span className="text-primary">{assessment.overallLevel}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">{assessment.recommendation}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill profile</CardTitle>
          <CardDescription>
            A detailed breakdown, not just one number — this drives what gets recommended to you.
          </CardDescription>
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
              <span className="w-14 shrink-0 text-right font-mono text-sm">
                {formatSubLevel(row.level as never, row.sub)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {assessment.strengths.map((s) => (
              <Badge key={s} variant="success">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Areas to focus on</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {assessment.weaknesses.map((s) => (
              <Badge key={s} variant="warning">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Not the right starting point? You can change your level anytime from Settings.
      </p>

      <Button asChild size="lg" className="w-full">
        <Link href="/dashboard">
          Go to my dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
