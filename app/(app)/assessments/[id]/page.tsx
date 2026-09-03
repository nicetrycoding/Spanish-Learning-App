import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SKILL_LABELS, type SkillKey } from "@/lib/cefr";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessment result" };

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const assessment = await db.assessment.findUnique({ where: { id }, include: { results: true } });
  if (!assessment || assessment.userId !== session.user.id) notFound();

  const previous = await db.assessment.findFirst({
    where: { userId: session.user.id, completedAt: { lt: assessment.completedAt ?? new Date() } },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="mb-2">
          {assessment.completedAt ? formatDate(assessment.completedAt) : ""}
        </Badge>
        <h1 className="font-serif-display text-3xl font-semibold">
          {assessment.overallLevel}{" "}
          {previous?.overallLevel && previous.overallLevel !== assessment.overallLevel && (
            <span className="text-base font-normal text-muted-foreground">(from {previous.overallLevel})</span>
          )}
        </h1>
        {assessment.recommendation && <p className="mt-2 text-muted-foreground">{assessment.recommendation}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.results.map((r) => (
            <div key={r.skill} className="flex items-center justify-between">
              <span className="text-sm">{SKILL_LABELS[r.skill as SkillKey]}</span>
              <Badge variant="outline">{r.cefrLevel}</Badge>
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
            <CardTitle className="text-base">Weaknesses</CardTitle>
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

      <Button asChild className="w-full">
        <Link href="/assessments">Back to assessments</Link>
      </Button>
    </div>
  );
}
